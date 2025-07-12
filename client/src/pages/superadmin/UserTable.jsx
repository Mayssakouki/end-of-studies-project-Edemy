import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table, TableBody, TableCaption, TableCell, TableHead,
  TableHeader, TableRow
} from "@/components/ui/table";
import { useGetAllInstructorsQuery, useUpdateInstructorApprovalMutation } from "@/features/api/authApi";
import { toast } from "sonner";

const UserTable = () => {
  const { data: instructors = [], refetch } = useGetAllInstructorsQuery();
  const [updateApproval] = useUpdateInstructorApprovalMutation();

  const handleApprove = async (id) => {
    try {
      await updateApproval({ 
        id, 
        approvalStatus: "approved" 
      }).unwrap();
      toast.success("Instructor approved successfully");
      refetch();
    } catch (error) {
      toast.error(error.data?.message || "Failed to approve instructor");
    }
  };

  const handleDisapprove = async (id) => {
    try {
      await updateApproval({ 
        id, 
        approvalStatus: "disapproved" 
      }).unwrap();
      toast.success("Instructor disapproved successfully");
      refetch();
    } catch (error) {
      toast.error(error.data?.message || "Failed to disapprove instructor");
    }
  };

  return (
    <div>
      <h1 className="font-bold text-xl mb-4">List of instructors</h1>
      <Table>
        <TableCaption>List of registered instructors</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>CV</TableHead>
            <TableHead className="text-right">Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {instructors.map((instructor) => (
            <TableRow key={instructor._id}>
              <TableCell>{instructor.name}</TableCell>
              <TableCell>{instructor.email}</TableCell>
              <TableCell>
                <a
                  href={instructor.cvURL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 underline flex items-center gap-1"
                >
                  View CV
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="1.5"
                    stroke="currentColor"
                    className="w-4 h-4"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M18 13.5V6a1.5 1.5 0 00-1.5-1.5H6m12 0L5.25 18.75"
                    />
                  </svg>
                </a>
              </TableCell>
              <TableCell className="text-right">
                {instructor.approvalStatus === "pending" ? (
                  <div className="space-x-2">
                    <Button 
                      onClick={() => handleApprove(instructor._id)}
                      size="sm"
                    >
                      Approve
                    </Button>
                    <Button 
                      onClick={() => handleDisapprove(instructor._id)}
                     
                      size="sm"
                    >
                      Disapprove
                    </Button>
                  </div>
                ) : instructor.approvalStatus === "approved" ? (
                  <Badge className="bg-green-500 text-white">Approved</Badge>
                ) : (
                  <Badge className="bg-red-500 text-white">Disapproved</Badge>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default UserTable;