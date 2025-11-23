import { Avatar, Button } from "@mui/material";
import { useFormik } from "formik";
import React, { useEffect, useState } from "react";
import * as Yup from "yup";
import ImageIcon from "@mui/icons-material/Image";
import FmdGoodIcon from "@mui/icons-material/FmdGood";
import TagFacesIcon from "@mui/icons-material/TagFaces";
import TweetCard from "./TweetCard";
import { useDispatch, useSelector } from "react-redux";
import { createTweet, getAllTweets } from './../../Store/Twit/Action';
import { store } from './../../Store/store';
import { uploadToCloudnary } from "../../Utils/uploadToCloudnary";

const validationSchema = Yup.object().shape({
  content: Yup.string().required("Tweet text is required"),
});
const HomeSection = () => {
  const [uploadingImage, setUploadingImage] = useState(false);
  const [selectImage, setSelectedImage] = useState("");
  const dispatch=useDispatch();
  const {twit}=useSelector(store=>store);
  // console.log("twit",twit)

  const handleSubmit = (values,actions) => {
    console.log("values", values);
    dispatch(createTweet(values))
    actions.resetForm()
    // console.log("values ", values);
    setSelectedImage("")
  };

  useEffect(()=>{
dispatch(getAllTweets())
  },[twit.like,twit.retwit])

  const formik = useFormik({
    initialValues: {
      content: "",
      image: "",
      isTweet:true
    },
    onSubmit: handleSubmit,
    validationSchema,
  });
  const handleSelectImage = async (event) => {
    setUploadingImage(true);
    const imgUrl = await uploadToCloudnary(event.target.files[0])
    formik.setFieldValue("image", imgUrl);
    setSelectedImage(imgUrl);
    setUploadingImage(false);
  };
  return (
    <div className="space-y-5">
      <section>
        <h1 className="py-5 text-xl font-bold opacity-90">Home</h1>
      </section>
      <section className={`pb-10`}>
        <div className="flex space-x-5">
          <Avatar
            alt="username"
            src="https://i.pinimg.com/736x/2a/50/2a/2a502a0a0fa654983190b5ec57c1532a.jpg"
          />
          <div className="w-full">
            <form onSubmit={formik.handleSubmit}>
              <div>
                <input
                  type="text"
                  name="content"
                  placeholder="Chuyện gì đang xảy ra vậy?"
                  className={`border-none outline-none text-xl bg-transparent`}
                  {...formik.getFieldProps("content")}
                />
                {formik.errors.content && formik.touched.content && (
                  <span className="text-red-500">{formik.errors.content}</span>
                )}
              </div>
              {/*<div>
                            <img src="" alt="" />
                        </div> */}
              <div className="flex justify-between items-center mt-5">
                <div className="flex space-x-5 items-center">
                  <label className="flex items-center space-x-2 rounded-md cursor-pointer">
                    <ImageIcon className="text-[#1d9bf0]" />
                    <input
                      type="file"
                      name="imageFile"
                      className="hidden"
                      onChange={handleSelectImage}
                    />
                  </label>
                  <FmdGoodIcon className="text-[#1d9bf0]" />
                  <TagFacesIcon className="text-[#1d9bf0]" />
                </div>
                <div>
                  <Button
                    sx={{
                      width: "100%",
                      borderRadius: "29px",
                      paddingY: "8px",
                      paddingX: "20px",
                      bgcolor: "#1e88e5",
                    }}
                    variant="contained"
                    type="submit"
                  >
                    Tweet
                  </Button>
                </div>
              </div>
            </form>
            <div>
              {selectImage && <img src={selectImage} alt="" />}
            </div>
          </div>
        </div>
      </section>
      <section>
        {console.log(twit)}
        {twit.twits.map((item)=> <TweetCard item={item}/>)}
      </section>
    </div>
  );
};

export default HomeSection;
