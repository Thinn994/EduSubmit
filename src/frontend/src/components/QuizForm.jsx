import { useState } from "react";
import { createQuiz } from "../services/api";
import toast from 'react-hot-toast';


function QuizForm({onCreated}){

    const [title,setTitle] = useState("");
    const [description,setDescription] = useState("");



    function handleSubmit(e){

        e.preventDefault();


        createQuiz(
            1,
            title,
            description
        )
        .then(()=>{
            toast.success("Quiz created");
            onCreated();

        });

    }



    return (

        <div>

            <h2>
                Create Quiz
            </h2>


            <form onSubmit={handleSubmit}>


                <input
                    placeholder="Quiz title"
                    value={title}
                    onChange={
                        e=>setTitle(e.target.value)
                    }
                />


                <br/>


                <textarea

                    placeholder="Description"

                    value={description}

                    onChange={
                        e=>setDescription(e.target.value)
                    }

                />


                <br/>


                <button type="submit">
                    Create Quiz
                </button>


            </form>


        </div>

    )

}


export default QuizForm;
