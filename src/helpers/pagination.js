const { Op } = require('sequelize');

/**
 * Transforms the query parameters into Sequelize filter options.
 * @param {Object} filter - req.query
 * @param {Object} model - Sequelize model to determine field types
 * @return {Object} - Filters for Sequelize query
 */
module.exports.useFilter = (filter, model, associations = []) => {
  if (!filter) {
    return {
      page: 1,
      limit: 10,
      sort: [['id', 'ASC']],
      search: '',
      filter: {},
    };
  }

  // Convert pagination parameters to numbers
  const page = filter.page ? Number(filter.page) : 1;
  const limit = filter.limit ? Number(filter.limit) : 10;

  // Convert sort parameter into Sequelize format
  const sort = filter.sort
    ? filter.sort.split(',').map((sortField) => {
        const [field, direction] = sortField.split('-');
        if (field.includes('.')) {
          const [modelAlias, nestedField] = field.split('.');
          const associationObj = associations.find(
            (a) => a.alias === modelAlias
          );
          if (associationObj) {
            return [
              { model: associationObj.model, as: modelAlias },
              nestedField,
              direction || 'ASC',
            ];
          }
        }
        return [field, direction || 'ASC'];
      })
    : [['id', 'ASC']];

  // Initialize the filter object
  let filterObj = {};

  if (filter.filter) {
    const parsedFilter = JSON.parse(filter.filter);

    for (const key in parsedFilter) {
      const value = parsedFilter[key];

      const fieldType = model.rawAttributes[key]?.type.key;

      if (key === 'to' && parsedFilter.from) {
        // Range filter for dates
        filterObj.createdAt = {
          ...filterObj.createdAt,
          [Op.between]: [
            new Date(parsedFilter.from).toISOString(),
            new Date(value).toISOString(),
          ],
        };
      } else if (key === 'from') {
        // Lower bound for date ranges
        filterObj.createdAt = {
          ...filterObj.createdAt,
          [Op.gte]: new Date(value).toISOString(),
        };
      } else if (key === 'to') {
        // Upper bound for date ranges
        filterObj.createdAt = {
          ...filterObj.createdAt,
          [Op.lte]: new Date(value).toISOString(),
        };
      } else if (fieldType === 'INTEGER') {
        // Exact match or range for integers
        if (value.includes('-')) {
          const [min, max] = value.split('-').map(Number);
          filterObj[key] = {
            [Op.between]: [min, max],
          };
        } else {
          filterObj[key] = {
            [Op.eq]: Number(value),
          };
        }
      } else if (fieldType === 'DATE') {
        // Exact match for dates
        filterObj[key] = {
          [Op.eq]: new Date(value).toISOString(),
        };
      } else {
        // Default to LIKE for other fields
        filterObj[key] = {
          [Op.like]: `%${value}%`,
        };
      }
    }
  }

  // Helper function to validate and parse search query
  const parseSearchValue = (value) => {
    if (!isNaN(Number(value))) {
      return Number(value);
    } else if (Date.parse(value)) {
      return new Date(value);
    }
    return value;
  };

  // Search functionality
  let searchConditions = [];

  // Process search parameters
  if (filter.search) {
    const parsedSearchValue = parseSearchValue(filter.search);

    // Main model search
    if (model && model.rawAttributes) {
      const attributes = Object.keys(model.rawAttributes);
      searchConditions = attributes
        .map((field) => {
          const fieldType = model.rawAttributes[field]?.type?.key;
          if (fieldType === 'DATE' && parsedSearchValue instanceof Date) {
            return {
              [field]: {
                [Op.like]: `%${parsedSearchValue.toISOString().split('T')[0]}%`,
              },
            };
          } else if (fieldType === 'INTEGER' || fieldType === 'FLOAT') {
            if (typeof parsedSearchValue === 'number') {
              return { [field]: { [Op.eq]: parsedSearchValue } };
            }
            return null;
          } else {
            return { [field]: { [Op.like]: `%${filter.search}%` } };
          }
        })
        .filter((condition) => condition !== null);
    }

    // Associated models search
    if (associations && associations.length > 0) {
      const nestedSearchConditions = associations.flatMap(({ alias, fields }) =>
        fields.map((nestedField) => ({
          [`$${alias}.${nestedField}$`]: {
            [Op.like]: `%${filter.search}%`,
          },
        }))
      );

      if (nestedSearchConditions.length > 0) {
        searchConditions.push(...nestedSearchConditions);
      }
    }
  }

  return {
    page,
    limit,
    sort,
    filter: filterObj,
    search: searchConditions.length > 0 ? { [Op.or]: searchConditions } : {},
  };
};
