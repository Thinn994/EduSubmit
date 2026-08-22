import { useEffect, useState } from "react";


function SubmissionStatusCard(){

    const [submission,setSubmission] = useState(null);


    useEffect(()=>{

        fetch(
            "http://127.0.0.1:5000/api/submissions/1"
        )
        .then(res=>res.json())
        .then(data=>{
            setSubmission(data);
        })

    },[]);



    if(!submission)
        return <p>Loading...</p>



    return (

        <div>

            <h2>
                My Submission
            </h2>


            <p>
                File:
                {submission.file_name}
            </p>


            <p>
                Status:
                {submission.status}
            </p>


            <p>
                Grade:
                {
                    submission.grade ??
                    "Waiting"
                }
            </p>


            <p>
                Feedback:
                {
                    submission.feedback ??
                    "No feedback"
                }
            </p>

        </div>

    )

}


export default SubmissionStatusCard;
