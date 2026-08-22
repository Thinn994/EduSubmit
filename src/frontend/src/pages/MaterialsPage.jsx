import MaterialUploadForm 
from "../components/MaterialUploadForm";

import MaterialList
from "../components/MaterialList";


function MaterialsPage(){


    return (

        <div>


            <h1>
                Course Materials
            </h1>


            <MaterialUploadForm />


            <MaterialList />


        </div>

    );

}


export default MaterialsPage;
