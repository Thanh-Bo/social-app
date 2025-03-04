/* eslint-disable react/prop-types */
import { IoCloseSharp } from "react-icons/io5";

const ImageModal = ({ isOpen, onClose, imgUrl }) => {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[999]"
      onClick={onClose}
    >
      <div 
        className="relative max-w-[90vw] max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="absolute top-4 right-4 text-white bg-gray-800 rounded-full p-2 hover:bg-gray-700"
          onClick={onClose}
        >
          <IoCloseSharp className="w-6 h-6" />
        </button>
        <img 
          src={imgUrl} 
          className="max-w-full max-h-[90vh] object-contain"
          alt="Full screen preview"
        />
      </div>
    </div>
  );
};

export default ImageModal;