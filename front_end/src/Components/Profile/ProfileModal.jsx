import * as React from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Modal from "@mui/material/Modal";
import { useFormik } from "formik";
import { Avatar, IconButton, TextField } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import "./ProfileModal.css";
import { useDispatch, useSelector } from "react-redux";
import { updateUserProfile } from "./../../Store/Auth/Action";
import { uploadToCloudnary } from "../../Utils/uploadToCloudnary";
import { store } from "../../Store/store";

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 480,
  maxHeight: "90vh",
  bgcolor: "background.paper",
  border: "none",
  boxShadow: 24,
  p: 3,
  outline: "none",
  borderRadius: 4,
};

export default function ProfileModal({ open, handleClose }) {
  //const [open, setOpen] = React.useState(false);
  const [uploading, setUploading] = React.useState(false);
  const dispatch = useDispatch();
  const [selectedImage, setSelectedImage] = React.useState("");
  const [selectedBgImage, setSelectedBgImage] = React.useState("");
  const { auth } = useSelector((store) => store);

  const handleSubmit = (values) => {
    dispatch(updateUserProfile(values));
    console.log("handle submit", values);
    setSelectedImage("");
    setSelectedBgImage("");
    handleClose();
  };

  const formik = useFormik({
    initialValues: {
      fullName: auth.user?.fullName || "",
      website: auth.user?.website || "",
      location: auth.user?.location || "",
      bio: auth.user?.bio || "",
      backgroundImage: auth.user?.backgroundImage || "",
      image: auth.user?.image || "",
    },
    enableReinitialize: true,
    onSubmit: handleSubmit,
  });
  const handleImageChange = async (event) => {
    setUploading(true);
    const { name, files } = event.target;
    if (!files || !files[0]) {
      setUploading(false);
      return;
    }
    const url = await uploadToCloudnary(files[0]);
    formik.setFieldValue(name, url);
    if (name === "backgroundImage") {
      setSelectedBgImage(url);
    } else if (name === "image") {
      setSelectedImage(url);
    }
    setUploading(false);
  };
  console.log("auth ",auth)
  return (
    <div>
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <form onSubmit={formik.handleSubmit}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <IconButton onClick={handleClose} aria-label="delete">
                  <CloseIcon />
                </IconButton>
                <p className="text-sm">Edit Profile</p>
              </div>
              <Button type="submit">Save</Button>
            </div>
            <div className="hideScrollBar overflow-y-auto overflow-x-hidden">
              <React.Fragment>
                <div className="w-full">
                  <div className="relative">
                    <img
                      className="w-full h-[12rem] object-cover object-center"
                      src={
                        selectedBgImage ||
                        (formik.values.backgroundImage
                          ? `http://localhost:5454${formik.values.backgroundImage}`
                          : "https://i.pinimg.com/736x/49/4d/3b/494d3b4fc5dd4a1c83820a6b0598c462.jpg")
                      }
                      alt="background"
                    />
                    <input
                      type="file"
                      className="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer"
                      onChange={handleImageChange}
                      name="backgroundImage"
                    />
                  </div>
                </div>
                <div className="w-full transform -translate-y-20 ml-4 h-[6rem]">
                  <div className="relative">
                    <Avatar
                      sx={{
                        width: "10rem",
                        height: "10rem",
                        border: "4px solid white",
                      }}
                      src={(() => {
                        if (selectedImage) {
                          // Nếu upload trả về path tương đối "/uploads/..." thì prefix host backend
                          return selectedImage.startsWith("/")
                            ? `http://localhost:5454${selectedImage}`
                            : selectedImage;
                        }
                        if (formik.values.image) {
                          return `http://localhost:5454${formik.values.image}`;
                        }
                        if (auth.user?.image) {
                          return `http://localhost:5454${auth.user.image}`;
                        }
                        return "https://i.pinimg.com/736x/2a/50/2a/2a502a0a0fa654983190b5ec57c1532a.jpg";
                      })()}
                    />
                    <input
                      className="absolute top-0 left-0 w-[10rem] h-full opacity-0 cursor-pointer"
                      onChange={handleImageChange}
                      name="image"
                      type="file"
                    />
                  </div>
                </div>
              </React.Fragment>
              <div className="space-y-3">
                <TextField
                  fullWidth
                  id="fullName"
                  name="fullName"
                  label="Full Name"
                  value={formik.values.fullName}
                  onChange={formik.handleChange}
                  error={
                    formik.touched.fullName && Boolean(formik.errors.fullName)
                  }
                  helperText={formik.touched.fullName && formik.errors.fullName}
                />
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  id="bio"
                  name="bio"
                  label="Bio"
                  value={formik.values.bio}
                  onChange={formik.handleChange}
                  error={formik.touched.bio && Boolean(formik.errors.bio)}
                  helperText={formik.touched.bio && formik.errors.bio}
                />
              </div>
            </div>
          </form>
        </Box>
      </Modal>
    </div>
  );
}
