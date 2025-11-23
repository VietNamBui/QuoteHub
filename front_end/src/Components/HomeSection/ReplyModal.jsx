import * as React from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Modal from "@mui/material/Modal";
import { Avatar } from "@mui/material";
import { useNavigate } from "react-router-dom";
import ImageIcon from "@mui/icons-material/Image";
import FmdGoodIcon from "@mui/icons-material/FmdGood";
import TagFacesIcon from "@mui/icons-material/TagFaces";
import { useFormik } from "formik";
import { useDispatch } from "react-redux";
import { createTweetReply } from "../../Store/Twit/Action";

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 600,
  bgcolor: "background.paper",
  border: "none",
  boxShadow: 24,
  p: 4,
  outline: "none",
  borderRadius: 4,
};

export default function ReplyModal({ handleClose, open, item }) {
  const navigate = useNavigate();
  const [uploadingImage, setUploadingImage] = React.useState(false);
  const [selectImage, setSelectedImage] = React.useState("");
  const dispatch=useDispatch();

  const handleSubmit = (values) => {
  dispatch(createTweetReply(values))
  handleClose()
    console.log("handle submit", values);
  };
  const formik = useFormik({
    initialValues: {
      content: "",
      image: "",
      twitId:item?.id
    },
    onSubmit: handleSubmit,
  });
  const handleSelectImage = (event) => {
    setUploadingImage(true);
    const imgUrl = event.target.files[0];
    formik.setFieldValue("image", imgUrl);
    setSelectedImage(imgUrl);
    setUploadingImage(false);
  };

  return (
    <div>
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          {item.replyTwits && item.replyTwits.length > 0 && (
            <div className="ml-10 mt-4 space-y-4">
              {item.replyTwits.map((reply) => (
                <div key={reply.id} className="flex space-x-5">
                  <Avatar
                    onClick={() => navigate(`/profile/${reply.user?.id}`)}
                    className="cursor-pointer"
                    alt={reply.user?.fullName}
                    src={reply.user?.avatar || "https://i.pinimg.com/736x/2a/50/2a/2a502a0a0fa654983190b5ec57c1532a.jpg"}
                  />
                  <div className="w-full">
                    <div className="flex justify-between items-center">
                      <div className="flex cursor-pointer items-center space-x-2">
                        <span className="font-semibold">{reply.user?.fullName}</span>
                        <span className="text-gray-600">@{reply.user?.username} . 2m</span>
                      </div>
                    </div>
                    <div className="mt-2">
                      <div
                        onClick={() => navigate(`/twit/${reply.id}`)}
                        className="cursor-pointer"
                      >
                        <p className="mb-2 p-0">{reply.content}</p>
                      </div>
                    </div>

                    {/* Đệ quy render reply của reply */}
                    {reply.replyTwits && reply.replyTwits.length > 0 && (
                      <div className="ml-10 mt-2">
                        {reply.replyTwits.map((r) => (
                          // Copy lại nội dung render reply như trên
                          <div key={r.id} className="flex space-x-5">
                            <Avatar
                              onClick={() => navigate(`/profile/${r.user?.id}`)}
                              className="cursor-pointer"
                              alt={r.user?.fullName}
                              src={r.user?.avatar}
                            />
                            <div className="w-full">
                              <p>{r.content}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          <section className={`py-10`}>
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
                      <span className="text-red-500">
                        {formik.errors.content}
                      </span>
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
              </div>
            </div>
          </section>
        </Box>
      </Modal>
    </div>
  );
}
