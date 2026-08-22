import { useState } from "react";
import { uploadMaterial } from "../services/api";
import toast from 'react-hot-toast';


function MaterialUploadForm({ courseId }){

    const [file, setFile] = useState(null);


    async function handleUpload(){

        if (!file) {
            toast.error("Please select a file");
            return;
        }

        const formData = new FormData();
        formData.append("file", file);
        formData.append("courseId", courseId);
        formData.append("uploaderName", "Lương Vĩ Lương");
        
        const result = await uploadMaterial(formData);
        if (result.success) {
            toast.success(result.message);
        } else {
            toast.error(result.message);
        }

        setFile(null);
    }



    return (

        <div>

            <h2>
                Upload Course Material
            </h2>


            <input
                type="file"
                onChange={
                    (e)=>setFile(
                        e.target.files[0]
                    )
                }
            />


            <button
                onClick={handleUpload}
            >
                Upload
            </button>


        </div>

    );

}


export default MaterialUploadForm;
