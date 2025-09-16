import {
  BarChart,
  ResponsiveContainer,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  Bar,
  Rectangle,
} from "recharts";

const data = [
  {
    name: "January",
    mr: 9,
    cr: 29,
    ir: 100,
  },
  {
    name: "February",
    mr: 20,
    cr: 5,
    ir: 4,
  },
  {
    name: "March",
    mr: 65,
    cr: 55,
    ir: 40,
  },
  {
    name: "April",
    mr: 21,
    cr: 79,
    ir: 30,
  },
  {
    name: "May",
    mr: 2,
    cr: 3,
    ir: 15,
  },
  {
    name: "June",
    mr: 90,
    cr: 30,
    ir: 25,
  },
  {
    name: "July",
    mr: 45,
    cr: 31,
    ir: 71,
  },
  {
    name: "August",
    mr: 45,
    cr: 31,
    ir: 25,
  },
  {
    name: "September",
    mr: 45,
    cr: 82,
    ir: 25,
  },
  {
    name: "October",
    mr: 45,
    cr: 90,
    ir: 20,
  },
  {
    name: "November",
    mr: 45,
    cr: 100,
    ir: 20,
  },
  {
    name: "December",
    mr: 9,
    cr: 29,
    ir: 100,
  },
];

const AnalyticsChart: React.FC = () => {
  return (
    <div className="h-full">
      <h2>Month-over-Month Reports by Type</h2>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          width={500}
          height={300}
          data={data}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar
            dataKey="mr"
            fill="#E3E1E1"
            activeBar={<Rectangle fill="pink" stroke="blue" />}
          />
          <Bar
            dataKey="cr"
            fill="#B8B3B3"
            activeBar={<Rectangle fill="gold" stroke="purple" />}
          />
          <Bar
            dataKey="ir"
            fill="#999999"
            activeBar={<Rectangle fill="gold" stroke="purple" />}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default AnalyticsChart;
