import { useState } from "react";

import QuizForm from "../components/QuizForm";
import QuizList from "../components/QuizList";


function QuizPage(){

    const [refresh, setRefresh] = useState(false);


    return (

        <div>

            <QuizForm
                onCreated={()=>{
                    setRefresh(!refresh);
                }}
            />


            <hr/>


            <QuizList
                refresh={refresh}
            />


        </div>

    )

}


export default QuizPage;
