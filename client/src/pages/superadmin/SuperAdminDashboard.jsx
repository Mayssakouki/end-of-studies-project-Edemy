import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useGetPurchasedCoursesQuery } from "@/features/api/purchaseApi";
import { useGetAllInstructorsQuery } from "@/features/api/authApi";
import React, { useEffect } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis
} from "recharts";

const SuperadminDashboard = () => {
  // Récupérer tous les achats
  const {
    data: purchaseData,
    isSuccess: isPurchaseSuccess,
    isError: isPurchaseError,
    isLoading: isPurchaseLoading,
    refetch: refetchPurchases,
  } = useGetPurchasedCoursesQuery(undefined, {
    refetchOnMountOrArgChange: true,
    refetchOnFocus: true,
  });

  // Récupérer tous les instructeurs
  const {
    data: instructorsData,
    isSuccess: isInstructorsSuccess,
    isError: isInstructorsError,
    isLoading: isInstructorsLoading,
  } = useGetAllInstructorsQuery(undefined, {
    refetchOnMountOrArgChange: true,
    refetchOnFocus: true,
  });

  // Forcer un rechargement des données
  useEffect(() => {
    refetchPurchases();
  }, [refetchPurchases]);

  // Vérifier l'état de chargement ou d'erreur
  if (isPurchaseLoading || isInstructorsLoading) return <h1>Loading...</h1>;
  if (isPurchaseError || isInstructorsError) return <h1 className="text-red-500">Failed to load data</h1>;

  // Vérifier si les données sont disponibles
  if (!purchaseData || !instructorsData) {
    console.log("No data available:", { purchaseData, instructorsData });
    return <h1>No data available</h1>;
  }

  const purchasedCourses = purchaseData.purchasedCourse || [];
  console.log("Purchased Courses in frontend:", purchasedCourses);

  // Calculer le revenu total
  const totalRevenue = purchasedCourses.reduce((acc, element) => {
    const amount = element.amount || 0;
    console.log("Purchase amount:", amount, "for course:", element.courseId?.courseTitle);
    return acc + amount;
  }, 0);
  const platformPercentage = 0.1; // 10% pour la plateforme
  const platformShare = totalRevenue * platformPercentage;
  const instructorsShare = totalRevenue * (1 - platformPercentage);

  // Données pour le graphique en anneau (revenue distribution)
  const revenueSplitData = [
    { name: "Platform Share", value: platformShare },
    { name: "Instructors Share", value: instructorsShare },
  ];

  const COLORS = ["#ff6b6b", "#2563eb"];

  // Calculer le revenu par instructeur
  const instructorRevenue = purchasedCourses.reduce((acc, purchase) => {
    const instructorId = purchase.courseId?.creator?._id;
    const instructorName = purchase.courseId?.creator?.name || "Unknown";
    if (!instructorId) {
      console.log("Instructor ID missing for purchase:", purchase);
      return acc;
    }
    if (!acc[instructorId]) {
      acc[instructorId] = { name: instructorName, revenue: 0 };
    }
    acc[instructorId].revenue += (purchase.amount || 0) * (1 - platformPercentage);
    return acc;
  }, {});

  const topInstructors = Object.values(instructorRevenue)
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 3); // Top 3 instructeurs

  // Calculer les revenus mensuels de la plateforme
  const monthlyPlatformRevenue = purchasedCourses.reduce((acc, purchase) => {
    const date = new Date(purchase.createdAt);
    const monthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    acc[monthYear] = (acc[monthYear] || 0) + ((purchase.amount || 0) * platformPercentage);
    return acc;
  }, {});

  const chartDataRevenue = Object.keys(monthlyPlatformRevenue)
    .sort()
    .map((monthYear) => ({
      month: monthYear,
      revenue: monthlyPlatformRevenue[monthYear],
    }));

  return (
    <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
      {/* Revenu total de la plateforme avec hauteur réduite */}
      <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 h-32"> {/* Hauteur réduite à 128px (h-32) */}
        <CardHeader>
          <CardTitle>Total Revenue (Platform)</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold text-blue-600">{platformShare.toFixed(2)} dt</p>
        </CardContent>
      </Card>

      {/* Nombre total d'instructeurs avec hauteur réduite */}
      <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 h-32"> {/* Hauteur réduite à 128px (h-32) */}
        <CardHeader>
          <CardTitle>Instructors</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold text-blue-600">{instructorsData.length}</p>
        </CardContent>
      </Card>

      {/* Répartition des revenus */}
      <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 md:col-span-2">
        <CardHeader>
          <CardTitle>Revenue Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-gray-600">Total Revenue: {totalRevenue.toFixed(2)} dt</p>
            <p className="text-sm text-gray-600">Platform Share (10%): {platformShare.toFixed(2)} dt</p>
            <p className="text-sm text-gray-600">Instructors Share (90%): {instructorsShare.toFixed(2)} dt</p>
            {totalRevenue > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={revenueSplitData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label
                  >
                    {revenueSplitData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-gray-500">No revenue data available</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Top 3 instructeurs par revenu */}
      <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 md:col-span-2 -mt-70">
        <CardHeader>
          <CardTitle>Top 3 Instructors by Revenue</CardTitle>
        </CardHeader>
        <CardContent>
          {topInstructors.length > 0 ? (
            <ul className="space-y-4">
              {topInstructors.map((instructor, index) => (
                <li key={index} className="flex justify-between items-center">
                  <span className="text-lg font-medium">{instructor.name}</span>
                  <p className="text-sm text-gray-600">Revenue: {instructor.revenue.toFixed(2)} dt</p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">No instructor revenue available</p>
          )}
        </CardContent>
      </Card>

      {/* Revenus mensuels de la plateforme */}
      <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 md:col-span-4">
        <CardHeader>
          <CardTitle>Monthly Revenue (Platform)</CardTitle>
        </CardHeader>
        <CardContent>
          {chartDataRevenue.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartDataRevenue}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="revenue" fill="#ff6b6b" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-500">No revenue data available</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SuperadminDashboard;