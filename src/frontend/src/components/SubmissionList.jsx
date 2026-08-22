import { useEffect, useState } from "react";
import { 
    getSubmissions,
    gradeSubmission
} from "../services/api";


function SubmissionList(){

    const [submissions,setSubmissions] = useState([]);

    const [grades,setGrades] = useState({});

    const [feedbacks,setFeedbacks] = useState({});


    const loadSubmissions = ()=>{

        getSubmissions()
        .then(data=>{
            setSubmissions(data);
        })

    }


    useEffect(()=>{

        loadSubmissions();

    },[]);



    const submitGrade = async(id)=>{

        await gradeSubmission(
            id,
            grades[id],
            feedbacks[id]
        );


        loadSubmissions();

    }



    return (
        <div>

            <h2>
                Student Submissions
            </h2>


            {
                submissions.map(
                    item=>(

                    <div key={item.id}>

                        <p>
                            File:
                            {item.file_name}
                        </p>


                        <p>
                            Status:
                            {item.status}
                        </p>


                        <p>
                            Grade:
                            {item.grade ?? "Not graded"}
                        </p>


                        <p>
                            Feedback:
                            {item.feedback ?? "None"}
                        </p>


                        <input
                            placeholder="Grade"
                            onChange={
                                e=>
                                setGrades({
                                    ...grades,
                                    [item.id]:e.target.value
                                })
                            }
                        />


                        <input
                            placeholder="Feedback"
                            onChange={
                                e=>
                                setFeedbacks({
                                    ...feedbacks,
                                    [item.id]:e.target.value
                                })
                            }
                        />


                        <button
                            onClick={
                                ()=>submitGrade(item.id)
                            }
                        >
                            Submit Grade
                        </button>


                    </div>

                ))
            }


        </div>
    )

}


export default SubmissionList;
