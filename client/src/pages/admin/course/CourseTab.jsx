// ce fichier représente la page ou l'enseignant il peut ajouter une formation ( course)

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import React, { useEffect, useState } from 'react'
import RichTextEditor from "@/components/RichTextEditor";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2 } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { useEditCourseMutation, useGetCourseByIdQuery, usePublishCourseMutation, useRemoveCourseMutation } from '@/features/api/courseApi';
import { toast } from "sonner";


const CourseTab = () => {

    const [input , setInput] = useState({
        courseTitle:"",
        subTitle:"",
        description:"",
        category:"",
        courseLevel:"",
        coursePrice:"",
        courseThumbnail:""
    });
    const params= useParams();
    const courseId = params.courseId;
    const {data:courseByIdData,isLoading:courseByIdLoading,refetch} = useGetCourseByIdQuery(courseId,{refetchOnMountOrArgChange:true}); 
    const [publishCourse,{}] = usePublishCourseMutation();
    const [deleteCourse] = useRemoveCourseMutation();


    
    useEffect(() => {
      if(courseByIdData?.course){
        const course = courseByIdData?.course;
        setInput({
          courseTitle:course.courseTitle,
          subTitle:course.subTitle,
          description:course.description,
          category:course.category,
          courseLevel:course.courseLevel,
          coursePrice:course.coursePrice,
          courseThumbnail:""
        }) 
      }
    },[courseByIdData])


    const [previewThumbnail, setPreviewThumbnail] = useState("");
    const navigate = useNavigate();
    
    const [editCourse, { data, isLoading, isSuccess, error }] =
    useEditCourseMutation();
    const changeEventHandler = (e) =>{
        const {name, value} = e.target;
        setInput({...input,[name]:value

        });
    };
    const selectCategory = (value) =>{
        setInput({...input,category:value});
    }
    const selectCourseLevel = (value) =>{
        setInput({...input,courseLevel:value});
    }

        // get file 
        const selectThumbnail = (e) => {
            const file = e.target.files?.[0];
            if (file) {
              setInput({ ...input, courseThumbnail: file });
              const fileReader = new FileReader();
              fileReader.onloadend = () => setPreviewThumbnail(fileReader.result);
              fileReader.readAsDataURL(file);
            }
          };

          const updateCourseHandler = async () => {
            const formData = new FormData();
            formData.append("courseTitle", input.courseTitle);
            formData.append("subTitle", input.subTitle);
            formData.append("description", input.description);
            formData.append("category", input.category);
            formData.append("courseLevel", input.courseLevel);
            formData.append("coursePrice", input.coursePrice);
            formData.append("courseThumbnail", input.courseThumbnail);
        
            await editCourse({ formData, courseId });
          };
          const publishStatusHandler = async (action) => {
            try {
              const response = await publishCourse({courseId, query:action});
              if(response.data){
                refetch();
                toast.success(response.data.message);
              }
            } catch (error) {
              toast.error("Failed to publish or unpublish course");
            }
          }

          useEffect(() => {
            if (isSuccess) {
              toast.success(data.message || "Course updated.");
            }
            if (error) {
              toast.error(error.data.message || "Failed to update course");
            }
          }, [isSuccess, error]);

          const removeCourseHandler = async () => {
            if (window.confirm("Are you sure you want to delete this course?")) {
              try {
                const res = await deleteCourse(courseId);
                if (res.data?.message) {
                  toast.success(res.data.message);
                  navigate("/admin/course");
                }
              } catch (err) {
                toast.error("Failed to delete course");
              }
            }
          };
          

    if(courseByIdLoading){
      return <h1>Loading ..</h1>;
    }      
         
   
  
  return (
    <Card>
         <CardHeader className="flex flex-row justify-between">
            <div>
                <CardTitle>Basic Course Information</CardTitle>
                <CardDescription>
                Make changes to your courses here. Click save when you're done.
                </CardDescription>
            </div>
            <div className='space-x-2'>
                <Button disabled={courseByIdData?.course.lectures.length===0} variant='outline' onClick={()=> publishStatusHandler(courseByIdData?.course.isPublished? "false":"true")} >
                {courseByIdData?.course.isPublished ? "Unpublished" : "Publish"}
                </Button>
                <Button onClick={removeCourseHandler}>Remove Courses </Button>
            </div>
        </CardHeader>
        <CardContent>
            <div className='space-y-4 mt-5'>
                <div>
                    <Label>Title</Label>
                    <Input className="mt-1" type="text" name="courseTitle" value={input.courseTitle} placeholder="Ex . FullStack developer" onChange={changeEventHandler}/>
                </div>
                <div>
                    <Label>Subtitle</Label>
                    <Input className="mt-1" type="text" name="subTitle" placeholder="Ex . Become a FullStack developer from zero to hero" onChange={changeEventHandler} value={input.subTitle}/>
                </div>
                <div>
            <Label>Description</Label>
            <RichTextEditor input={input} setInput={setInput} />
          </div>
                <div className='flex items-center gap-5'>
                    <div>
                        <Label>Category</Label>
                        <Select onValueChange={selectCategory}>
            <SelectTrigger className="w-[180px] mt-1">
              <SelectValue placeholder="Select a category" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                             <SelectLabel>Category</SelectLabel>
                             
                             <SelectItem value="Data Science">Data Science</SelectItem>
                           
                             <SelectItem value="Javascript">Javascript</SelectItem>
                             <SelectItem value="Python">Python</SelectItem>
                             <SelectItem value="Docker">Docker</SelectItem>
                             <SelectItem value="MongoDB">MongoDB</SelectItem>
                             <SelectItem value="HTML">HTML</SelectItem>
                             <SelectItem value="React">React</SelectItem>
                             <SelectItem value="Node">Node</SelectItem>
                            <SelectItem value="Express">Express</SelectItem>
                            <SelectItem value="Mongoose">Mongoose</SelectItem>
                            <SelectItem value="CSS">CSS</SelectItem>
                            <SelectItem value="Bootstrap">Bootstrap</SelectItem>
                            <SelectItem value="JQuery">JQuery</SelectItem>
                            <SelectItem value="ML">ML</SelectItem>
                            <SelectItem value="DL">DL</SelectItem>
                            <SelectItem value="Kubernetes">Kubernetes</SelectItem>
                            <SelectItem value="CI/CD">CI/CD</SelectItem>
                            <SelectItem value="AWS">AWS</SelectItem>
                            <SelectItem value="Devops">Devops</SelectItem>
                            <SelectItem value="Flutter">Flutter</SelectItem>
                            <SelectItem value="Firebase">Firebase</SelectItem>
                            <SelectItem value="SQLite">SQLite</SelectItem>
                            <SelectItem value="React Native">React Native</SelectItem>
                             
                             
                           </SelectGroup>
            </SelectContent>
                        </Select>
                    </div>
                    <div>
                        <Label>Course Level </Label>
                        <Select onValueChange={selectCourseLevel}>
            <SelectTrigger className="w-[180px] mt-1">
              <SelectValue placeholder="Select a course level" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Course Level</SelectLabel>
                <SelectItem value="Beginner">Beginner</SelectItem>
                <SelectItem value="Medium">Medium</SelectItem>
                <SelectItem value="Advanced">Advanced</SelectItem>
               
              </SelectGroup>
            </SelectContent>
                        </Select>
                    </div>
                    <div>
                        <Label>Price </Label>
                        <Input type="number" name="coursePrice" value={input.coursePrice} onChange={changeEventHandler} placeholder="100TND" className="w-fit mt-1"/>
                    </div>
                    </div>
                    <div>
                        <Label>Course Thumbnail</Label>
                        <Input type="file" accept="image/*" className="w-fit mt-1" onChange={selectThumbnail} />
                        {previewThumbnail && (
                                    <img
                                        src={previewThumbnail}
                                        className="e-64 my-2"
                                        alt="Course Thumbnail"
                                    />
                                    )}

                    </div>
                    <div>
                        <Button variant="outline" onClick={()=>navigate("/admin/course")}>Cancel</Button>
                        <Button disabled={isLoading} onClick={updateCourseHandler}>{
                            isLoading?(
                                <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin "/>
                                Please wait
                                </>
                            ) :"Save"
                           }
                        </Button>

                    </div>


                </div>


            
        </CardContent>

    </Card>
  )
}

export default CourseTab

/*
 <SelectItem value="Frontend Development">
                  Frontend Development
                </SelectItem>
                <SelectItem value="Fullstack Development">
                  Fullstack Development
                </SelectItem>
                <SelectItem value="MERN Stack Development">
                  MERN Stack Development
                </SelectItem>
*/ 