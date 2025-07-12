import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useLoadUserQuery } from "@/features/api/authApi";
import { useGetCreatorCourseQuery } from "@/features/api/courseApi";
import { Edit } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "sonner";

const CourseTable = () => {
  const { data: courseData, isLoading, refetch: refetchCourses } = useGetCreatorCourseQuery();
  const { data: auth, refetch: refetchUser } = useLoadUserQuery();
  const navigate = useNavigate();

  const [cvFile, setCvFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    refetchUser();
    refetchCourses();
  }, []);

  if (isLoading || !auth?.user?.role || !courseData) return <h1>Loading...</h1>;

  const user = auth.user;
  const isInstructor = user.role === "instructor";
  const isAdmin = user.role === "admin";

  // Ces variables ne sont pertinentes que pour les instructeurs
  const showUploadField = isInstructor && (!user.cvURL || user.approvalStatus === "disapproved");
  const createButtonDisabled = isInstructor && (!user.cvURL || user.approvalStatus !== "approved");

  const getBadgeColor = () => {
    switch (user.approvalStatus) {
      case "approved":
        return "bg-green-500";
      case "pending":
        return "bg-yellow-500";
      case "disapproved":
        return "bg-red-500";
      default:
        return "bg-gray-400";
    }
  };

  const handleUpload = async () => {
    if (!cvFile) return;

    const formData = new FormData();
    formData.append('file', cvFile);
    formData.append('userId', user._id);

    try {
      setUploading(true);
      await axios.post("http://localhost:8080/api/v1/media/upload-cv", formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      toast('CV uploaded successfully. Waiting for admin approval.');
      refetchUser();
    } catch (error) {
      console.error(error);
      toast('Error uploading CV.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="p-6">
      {/* Section d'en-tête conditionnelle */}
      {isInstructor && (
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Welcome, {user.name}</h2>
          <Badge className={`${getBadgeColor()} text-white capitalize`}>
            {user.approvalStatus}
          </Badge>
        </div>
      )}

      {/* Section d'upload CV conditionnelle */}
      {showUploadField && (
        <div className="bg-yellow-100 p-4 rounded-md mb-4">
          <p className="mb-2">
            {user.approvalStatus === "disapproved"
              ? "Your CV was rejected. Please upload a new one."
              : "Please upload your CV to create a course."}
          </p>
          <input
            type="file"
            accept="application/pdf"
            onChange={(e) => setCvFile(e.target.files[0])}
            className="mb-2"
          />
          <Button
            disabled={!cvFile || uploading}
            onClick={handleUpload}
            className="mt-1"
          >
            {uploading ? "Uploading..." : "Upload CV"}
          </Button>
        </div>
      )}

      {isInstructor && user.cvURL && user.approvalStatus === "pending" && (
        <p className="text-yellow-600 mb-4">
          CV uploaded. Waiting for admin approval.
        </p>
      )}

      {/* Bouton de création conditionnel */}
      {isInstructor && (
        <Button
          onClick={() => navigate(`create`)}
          disabled={createButtonDisabled}
          className={`mb-4 ${createButtonDisabled ? "opacity-50 cursor-not-allowed" : ""}`}
        >
          Create a new course
        </Button>
      )}

      {/* Table des cours (visible pour tous) */}
      <Table>
        <TableCaption>A list of your recent courses.</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">Price</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Title</TableHead>
            {isAdmin && <TableHead>Teacher</TableHead>}
            
            <TableHead className="text-right">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {courseData.courses.map((course) => (
            <TableRow key={course._id}>
              <TableCell className="font-medium">{course.coursePrice || "TND"}</TableCell>
              <TableCell>
                <Badge>{course.isPublished ? "Published" : "Draft"}</Badge>
              </TableCell>
              <TableCell>{course.courseTitle}</TableCell>
              {isAdmin && <TableCell>{course.creator?.name}</TableCell>}
              <TableCell className="text-right">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => navigate(`${course._id}`)}
                >
                  <Edit />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default CourseTable;