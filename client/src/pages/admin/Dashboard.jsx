import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useGetPurchasedCoursesQuery } from "@/features/api/purchaseApi";
import React from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

const Dashboard = () => {
  const {
    data,
    isSuccess,
    isError,
    isLoading
  } = useGetPurchasedCoursesQuery(undefined, {
    refetchOnMountOrArgChange: true, // Refetch on component mount
    refetchOnFocus: true // Refetch when tab regains focus
  });

  console.log({ data, isLoading, isError, isSuccess });

  if (isLoading) return <h1>Loading...</h1>;
  if (isError) return <h1 className="text-red-500">Failed to get purchased course</h1>;
  if (!data || !data.purchasedCourse) return <h1>No data available</h1>;

  const purchasedCourses = data.purchasedCourse;

  // Calculate total revenue and total sales
  const totalRevenue = purchasedCourses.reduce((acc, element) => acc + (element.amount || 0), 0);
  const totalSales = purchasedCourses.length;

  // Calculate top 3 best-selling courses
  const courseSales = purchasedCourses.reduce((acc, purchase) => {
    const courseId = purchase.courseId._id;
    const courseTitle = purchase.courseId.courseTitle;
    if (!acc[courseId]) {
      acc[courseId] = { title: courseTitle, count: 0, revenue: 0 };
    }
    acc[courseId].count += 1;
    acc[courseId].revenue += purchase.amount || 0;
    return acc;
  }, {});

  const topCourses = Object.values(courseSales)
    .sort((a, b) => b.count - a.count) // Sort by number of sales
    .slice(0, 3); // Take top 3

  // Calculate monthly revenue
  const monthlyRevenue = purchasedCourses.reduce((acc, purchase) => {
    const date = new Date(purchase.createdAt);
    const monthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`; // Format: YYYY-MM
    acc[monthYear] = (acc[monthYear] || 0) + (purchase.amount || 0);
    return acc;
  }, {});

  // Prepare data for the chart
  const chartData = Object.keys(monthlyRevenue)
    .sort() // Sort by month-year
    .map((monthYear) => ({
      month: monthYear,
      revenue: monthlyRevenue[monthYear],
    }));

  return (
    <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
      {/* Total Sales Card */}
      <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
        <CardHeader>
          <CardTitle>Total Sales</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold text-blue-600">{totalSales}</p>
        </CardContent>
      </Card>

      {/* Total Revenue Card */}
      <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
        <CardHeader>
          <CardTitle>Total Revenue</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold text-blue-600">{totalRevenue} dt</p>
        </CardContent>
      </Card>

      {/* Top 3 Best-Selling Courses Card */}
      <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 md:col-span-2">
        <CardHeader>
          <CardTitle>Top 3 Best-Selling Courses</CardTitle>
        </CardHeader>
        <CardContent>
          {topCourses.length > 0 ? (
            <ul className="space-y-4">
              {topCourses.map((course, index) => (
                <li key={index} className="flex justify-between items-center">
                  <span className="text-lg font-medium">{course.title}</span>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Sales: {course.count}</p>
                    <p className="text-sm text-gray-600">Revenue: {course.revenue} dt</p>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">No sales data available</p>
          )}
        </CardContent>
      </Card>

      {/* Monthly Revenue Chart */}
      <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 md:col-span-4">
        <CardHeader>
          <CardTitle>Monthly Revenue</CardTitle>
        </CardHeader>
        <CardContent>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="revenue" stroke="#2563eb" activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-500">No revenue data available</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;