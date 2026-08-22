import { useEffect, useState } from "react";
import { getMaterials, downloadMaterial } from "../services/api";


function MaterialList(){


    const [materials, setMaterials] = useState([]);



    useEffect(()=>{

        getMaterials(1)
        .then(data=>{

            setMaterials(data);

        });

    },[]);



    return (

        <div>


            <h2>
                Course Materials
            </h2>


            {
                materials.map(
                    material => (

                    <div 
                        key={material.id}
                    >

                        <p>
                            File:
                            {material.file_name}
                        </p>


                        <p>
                            Type:
                            {material.file_type}
                        </p>


                        <button
                            onClick={()=>{
                                downloadMaterial(material.id)
                            }}
                        >
                            Download
                        </button>


                    </div>

                    )
                )
            }


        </div>

    );

}


export default MaterialList;
