import * as React from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Modal from "@mui/material/Modal";
import { IconButton } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import FiberManualRecordIcon from "@mui/icons-material/FiberManualRecord";

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 600,
  bgcolor: "background.paper",
  border: "none",
  outline: "none",
  boxShadow: 24,
  p: 4,
  borderRadius: 4,
};

const fetures=["Prioriawhdakcjecd","áygdjsxah","djcxgacsha"]

export default function SubcriptionModal({handleClose,open}) {


  const [plan, setPlan] = React.useState("Anunalluy");

  return (
    <div>

      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <div className="flex items-center space-x-3">
            <IconButton onClick={handleClose} aria-label="delete">
              <CloseIcon />
            </IconButton>
          </div>
          <div className="flex justify-center py-10">
            <div className="w-[80%] space-y-10">
              <div className="p-5 rounded-md flex items-center justify-between bg-slate-400 shadow-lg">
                <h1 className="text-xl pr-5">sdbsjdghfszdaedsn</h1>
                <img
                  className="w-24 h-24"
                  src="https://i.pinimg.com/1200x/35/6c/ba/356cba6f3c6d16a3ad8b5a878f7e8d3b.jpg"
                  alt=""
                />
              </div>
              <div className="flex justify-between border rounded-full px-5 py-3 border border-gray-500">
                <div>
                  <span
                    onClick={() => setPlan("Anunalluy")}
                    className={`${
                      plan === "Anunalluy" ? "text-black" : "text-gray-400"
                    } cursor-pointer`}
                  >
                    Anunalluy
                  </span>
                  <span className="text-green-500 text-sm ml-5">SAVE 12%</span>
                </div>
                <p
                  onClick={() => setPlan("monthly")}
                  className={`${
                    plan === "monthly" ? "text-black" : "text-gray-400"
                  } cursor-pointer`}
                >
                  Monthly
                </p>
              </div>
              <div className="space-y-3">
                {fetures.map((item)=> <div className="flex items-center space-x-5">
                  <FiberManualRecordIcon sx={{ width: "7px", height: "7px" }} />
                  <p className="text-xs">
                    {item}

                  </p>
                </div>) }
              </div>
              <div className="cursor-pointer flex justify-center bg-gray-900 text-white rounded-full px-5 py-3">
                <span className="line-through italic">100.000đ</span>
                <span className="px-5">60.000đ/năm</span>
              </div>
            </div>
          </div>
        </Box>
      </Modal>
    </div>
  );
}
