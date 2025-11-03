# MySQL to PostgreSQL Merge Guide

## Steps to Merge and Update

### 1. Perform the Git Merge
Run these commands in your shell:
```bash
# First, fetch the latest changes from main
git fetch origin main

# Then merge main into mysql-postgres branch
git merge origin/main

# You will likely see merge conflicts
```

### 2. Expected Conflict Areas

After merging, you'll need to update these areas for PostgreSQL compatibility:

#### A. Database Configuration Files
- **packages/backend/src/config/config.js**
  - Keep `dialect: 'postgres'` (not 'mysql')
  - Keep the `dialectOptions` with SSL settings
  
- **packages/backend/.env**
  - Ensure PostgreSQL connection string format
  - DATABASE_URL should start with `postgresql://`

#### B. Sequelize Models
The models should generally work with both databases, but check for:
- Any `TINYINT(1)` should be `BOOLEAN`
- MySQL `JSON` columns work in PostgreSQL
- UUID columns are compatible

#### C. Migration/Import Scripts
Any new migration scripts from main will need conversion:
- Remove backticks (`) and replace with double quotes (")
- Convert `0`/`1` to `FALSE`/`TRUE` for boolean values
- Handle JSON differently (PostgreSQL uses `::json` casting)

### 3. Key Files to Review After Merge

1. **Database Config**: `packages/backend/src/config/config.js`
   - Should have `dialect: 'postgres'`
   - Should have SSL dialectOptions

2. **Environment Variables**: `packages/backend/.env`
   - DATABASE_URL format
   - DIALECT=postgres

3. **Import/Migration Scripts**: `packages/backend/src/scripts/`
   - Any new scripts need PostgreSQL syntax

### 4. Common PostgreSQL Conversions

| MySQL | PostgreSQL |
|-------|-----------|
| \`table\` | "table" |
| TINYINT(1) | BOOLEAN |
| 0/1 (for bool) | FALSE/TRUE |
| JSON column | JSON or JSONB |
| AUTO_INCREMENT | SERIAL or UUID |

### 5. Testing After Merge

After resolving conflicts and updating code:

```bash
# 1. Install dependencies
cd packages/backend
pnpm install

# 2. Test database connection
node -e "const {sequelize} = require('./src/models'); sequelize.authenticate().then(() => console.log('Connected!')).catch(err => console.error(err))"

# 3. Run the application
pnpm dev
```

### 6. Conflict Resolution Strategy

When you encounter merge conflicts:

1. **For config files**: Keep PostgreSQL settings
2. **For models**: Generally keep the incoming changes but ensure PostgreSQL compatibility
3. **For migrations**: Convert MySQL syntax to PostgreSQL
4. **For API code**: Usually no changes needed

### 7. Quick Checklist

- [ ] Merged main branch into mysql-postgres
- [ ] Resolved all merge conflicts
- [ ] Updated config.js to use PostgreSQL
- [ ] Verified .env has PostgreSQL connection
- [ ] Converted any new MySQL-specific code
- [ ] Tested database connection
- [ ] Application runs successfully

## PostgreSQL-Specific Features We're Using

1. **SSL Connection**: Required for Neon PostgreSQL
2. **JSON/JSONB**: For report templates and answers
3. **UUID Generation**: Using gen_random_uuid()
4. **Boolean Type**: Native boolean support
5. **CASCADE**: For foreign key constraints

## Common Issues and Solutions

### Issue: "relation does not exist"
Solution: Table names are case-sensitive in PostgreSQL. Use double quotes.

### Issue: "column '0' does not exist"
Solution: Convert 0/1 to FALSE/TRUE for booleans.

### Issue: JSON parsing errors
Solution: Use ::json casting and proper escaping.

### Issue: SSL connection required
Solution: Ensure dialectOptions includes SSL settings.