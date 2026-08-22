import { useState } from "react";
import { submitAssignment } from "../services/api";


function AssignmentSubmissionForm(){

    const [file, setFile] = useState(null);
    const [message, setMessage] = useState("");


    async function handleSubmit(e){

        e.preventDefault();

        if(!file){
            setMessage("Please select a file");
            return;
        }


        const formData = new FormData();

        formData.append(
            "file",
            file
        );

        // test data
        formData.append(
            "assignment_id",
            1
        );

        formData.append(
            "student_id",
            1
        );


        const result = await submitAssignment(formData);


        setMessage(result.message);
    }


    return (
        <div className="
            bg-white
            p-6
            rounded-lg
            shadow-md
            w-96
        ">

            <h2 className="
                text-xl
                font-bold
                mb-4
            ">
                Submit Assignment
            </h2>


            <form onSubmit={handleSubmit}>


                <input
                    type="file"
                    onChange={
                        (e)=>setFile(e.target.files[0])
                    }
                    className="mb-4"
                />


                <button
                    className="
                    bg-blue-500
                    text-white
                    px-4
                    py-2
                    rounded
                    "
                >
                    Upload
                </button>


            </form>


            <p className="mt-3">
                {message}
            </p>


        </div>
    );
}


export default AssignmentSubmissionForm;
