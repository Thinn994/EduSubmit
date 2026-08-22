import { useEffect, useState } from "react";
import { getQuizzes } from "../services/api";


function QuizList({refresh}){


    const [quizzes,setQuizzes] = useState([]);



    useEffect(()=>{


        getQuizzes(1)
        .then(data=>{

            setQuizzes(data);

        });


    },[refresh]);



    return (

        <div>


            <h2>
                Quiz List
            </h2>


            {
                quizzes.map(
                    quiz=>(

                    <div
                        key={quiz.id}
                    >

                        <h3>
                            {quiz.title}
                        </h3>


                        <p>
                            {quiz.description}
                        </p>


                    </div>

                    )
                )
            }


        </div>

    )


}


export default QuizList;
