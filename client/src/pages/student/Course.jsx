import React, { useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Heart } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useToggleFavoriteCourseMutation, useGetFavoriteCoursesQuery, useLoadUserQuery } from "@/features/api/authApi";
import { toast } from "sonner";

const Course = ({ course }) => {
  const [liked, setLiked] = useState(false);
  const [toggleFavoriteCourse] = useToggleFavoriteCourseMutation();
  const { data: favoriteCoursesData, refetch } = useGetFavoriteCoursesQuery();
  const { data: userData } = useLoadUserQuery(); // Récupérer les données de l'utilisateur
  const navigate = useNavigate();

  // Vérifier si le cours est dans les favoris au chargement
  useEffect(() => {
    if (favoriteCoursesData?.favoriteCourses) {
      const isFavorited = favoriteCoursesData.favoriteCourses.some(
        (favCourse) => favCourse._id === course._id
      );
      setLiked(isFavorited);
    } else {
      setLiked(false); // Réinitialiser si aucune donnée de favoris
    }
  }, [favoriteCoursesData, course._id, userData?.user?._id]); // Ajouter userData?.user?._id comme dépendance

  const toggleLike = async (e) => {
    e.preventDefault(); // Empêche la navigation lors du clic sur le cœur
    try {
      await toggleFavoriteCourse(course._id).unwrap();
      setLiked(!liked);
      refetch(); // Rafraîchir la liste des favoris
      toast.success(liked ? "Course removed from favorites" : "Course added to favorites");
      navigate("/profile"); // Rediriger vers la page de profil
    } catch (error) {
      toast.error("Failed to update favorite status");
    }
  };

  return (
    <Link to={`/course-detail/${course._id}`}>
      <Card className="relative overflow-hidden rounded-lg dark:bg-gray-800 bg-white shadow-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-300">
        <div className="relative">
          <img
            src={course.courseThumbnail}
            className="w-full h-36 object-cover rounded-t-lg"
            alt="course"
          />
        </div>
        <CardContent className="px-5 py-4 space-y-3">
          <h1 className="hover:underline font-bold text-lg truncate">{course.courseTitle}</h1>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar className="h-8 w-8">
                <AvatarImage src={course.creator?.photoURL || "https://github.com/shadcn.png"} alt="@creator" />
                <AvatarFallback>CN</AvatarFallback>
              </Avatar>
              <h1 className="font-medium text-sm">{course.creator?.name}</h1>
            </div>
            <Badge className="bg-blue-600 text-white px-2 py-1 text-xs rounded-full">{course.courseLevel}</Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-lg font-bold">{course.coursePrice} dt</span>
          </div>
        </CardContent>

        {/* ❤️ Icône cœur */}
        <div className="absolute bottom-4 right-4 cursor-pointer" onClick={toggleLike}>
          <Heart
            size={24}
            className={`transition-colors duration-300 ${liked ? "text-red-600" : "text-gray-400"}`}
            fill={liked ? "red" : "transparent"}
          />
        </div>
      </Card>
    </Link>
  );
};

export default Course;




/*import React, { useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Heart } from "lucide-react";
import { Link, useNavigate } from "react-router-dom"; // Importer useNavigate
import { useToggleFavoriteCourseMutation, useGetFavoriteCoursesQuery } from "@/features/api/authApi";
import { toast } from "sonner";

const Course = ({ course }) => {
  const [liked, setLiked] = useState(false);
  const [toggleFavoriteCourse] = useToggleFavoriteCourseMutation();
  const { data: favoriteCoursesData, refetch } = useGetFavoriteCoursesQuery();
  const navigate = useNavigate(); // Initialiser useNavigate

  // Vérifier si le cours est dans les favoris au chargement
  useEffect(() => {
    if (favoriteCoursesData?.favoriteCourses) {
      const isFavorited = favoriteCoursesData.favoriteCourses.some(
        (favCourse) => favCourse._id === course._id
      );
      setLiked(isFavorited);
    }
  }, [favoriteCoursesData, course._id]);

  const toggleLike = async (e) => {
    e.preventDefault(); // Empêche la navigation lors du clic sur le cœur
    try {
      await toggleFavoriteCourse(course._id).unwrap();
      setLiked(!liked);
      refetch(); // Rafraîchir la liste des favoris
      toast.success(liked ? "Course removed from favorites" : "Course added to favorites");
      navigate("/profile"); // Rediriger vers la page de profil
    } catch (error) {
      toast.error("Failed to update favorite status");
    }
  };

  return (
    <Link to={`/course-detail/${course._id}`}>
      <Card className="relative overflow-hidden rounded-lg dark:bg-gray-800 bg-white shadow-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-300">
        <div className="relative">
          <img
            src={course.courseThumbnail}
            className="w-full h-36 object-cover rounded-t-lg"
            alt="course"
          />
        </div>
        <CardContent className="px-5 py-4 space-y-3">
          <h1 className="hover:underline font-bold text-lg truncate">{course.courseTitle}</h1>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar className="h-8 w-8">
                <AvatarImage src={course.creator?.photoURL || "https://github.com/shadcn.png"} alt="@creator" />
                <AvatarFallback>CN</AvatarFallback>
              </Avatar>
              <h1 className="font-medium text-sm">{course.creator?.name}</h1>
            </div>
            <Badge className="bg-blue-600 text-white px-2 py-1 text-xs rounded-full">{course.courseLevel}</Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-lg font-bold">{course.coursePrice} dt</span>
          </div>
        </CardContent>

        <div className="absolute bottom-4 right-4 cursor-pointer" onClick={toggleLike}>
          <Heart
            size={24}
            className={`transition-colors duration-300 ${liked ? "text-red-600" : "text-gray-400"}`}
            fill={liked ? "red" : "transparent"}
          />
        </div>
      </Card>
    </Link>
  );
};

export default Course; */