import { useEffect, useState } from "react";
import assets from "../../assets/assets";
import "./ProfileUpdate.css";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../../config/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { uploadToCloudinary } from "../../lib/uploadToCloudinary"; // Import the function

const ProfileUpdate = () => {
  const [image, setImage] = useState(null);
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [uid, setUid] = useState("");
  const [prevImage, setPrevImage] = useState("");
  const navigate = useNavigate();

  // 🔹 Load user data from Firestore when component mounts
  useEffect(() => {
    onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUid(user.uid);
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setName(docSnap.data().name || "");
          setBio(docSnap.data().bio || "");
          setPrevImage(docSnap.data().avatar || "");
        }
      } else {
        navigate("/");
      }
    });
  }, [navigate]);

  // 🔹 Profile update function
  const profileUpdate = async (event) => {
    event.preventDefault();

    try {
      let imageUrl = prevImage; // Keep existing image if not changed

      // 🔹 Upload new image if selected
      if (image) {
        toast.info("Uploading profile image...");
        imageUrl = await uploadToCloudinary(image);

        if (!imageUrl) {
          toast.error("Image upload failed. Try again.");
          return;
        }
      }

      // 🔹 Update Firestore with new details
      const userRef = doc(db, "users", uid);
      await updateDoc(userRef, {
        name,
        bio,
        avatar: imageUrl, // Store Cloudinary image URL
      });

      toast.success("Profile updated successfully!");

      // 🔹 Update UI with new image & reset input
      setPrevImage(imageUrl);
      setImage(null);

      // 🔹 Navigate to chat page after update

      navigate("/chat");
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Profile update failed. Try again.");
    }
  };

  return (
    <div className="profile">
      <div className="profile-container">
        <form onSubmit={profileUpdate}>
          <h3>Profile Details</h3>

          {/* Profile Image Upload */}
          <label htmlFor="avatar">
            <input
              onChange={(e) => setImage(e.target.files[0])}
              type="file"
              id="avatar"
              accept=".png, .jpg, .jpeg"
              hidden
            />
            <img
              src={
                image
                  ? URL.createObjectURL(image)
                  : prevImage
                  ? prevImage
                  : assets.avatar_icon
              }
              alt="Profile"
              onError={(e) => (e.target.src = assets.avatar_icon)} // Fallback for broken image
            />
            Upload Profile Image
          </label>

          {/* Name & Bio Fields */}
          <input
            type="text"
            onChange={(e) => setName(e.target.value)}
            value={name}
            placeholder="Your name"
            required
          />
          <textarea
            onChange={(e) => setBio(e.target.value)}
            value={bio}
            placeholder="Write profile bio"
            required
          ></textarea>

          <button type="submit">Save</button>
        </form>

        {/* Profile Preview */}
        <img
          src={image ? URL.createObjectURL(image) : prevImage ? prevImage : assets.logo_icon}
          className="profile-pic"
          onError={(e) => (e.target.src = assets.avatar_icon)}
        />
      </div>
    </div>
  );
};

export default ProfileUpdate;
