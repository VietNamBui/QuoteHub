export const uploadToCloudnary=async(pics)=>{

    if(pics){
        const data=new FormData();
        data.append("file",pics)
        data.append("upload_preset","instagram");
        data.append("cloud_name","dcpesbd8q")

        const res= await fetch("",{
            method:"post",
            body:data
        })

        const fileData=await res.json();
        return fileData.url.toString();


    }
    else console.log("error from upload function" )

}