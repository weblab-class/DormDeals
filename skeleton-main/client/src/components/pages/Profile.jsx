import React, { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { get, post } from "../../utilities";
import "./Profile.css";
import backgroundimg from "../../assets/mit-dome.jpg";
import defaultpfpimg from "../../assets/blank-profile.png";

const Profile = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [userandinformation, setUser] = useState([]);
  const [viewingUser, setViewingUser] = useState();
  const [userItems, setUserItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showEditForm, setShowEditForm] = useState(false);
  const [newPicture, setNewPicture] = useState({ picture: [defaultpfpimg] });
  const [newBackground, setNewBackground] = useState({ picture: [backgroundimg] });
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    get(`/api/user`, { userid: userId }).then((userObj) => {
      setUser(userObj);
      setIsLoading(false);
      if (userObj[1]?.picture) {
        setNewPicture({ picture: [userObj[1].picture] });
      }
      if (userObj[1]?.backgroundImage) {
        setNewBackground({ picture: [userObj[1].backgroundImage] });
      }
    });
    get(`/api/whoami`).then((viewingUserObj) => {
      setViewingUser(viewingUserObj);
      if (viewingUserObj?._id === userId) {
        setUser((prev) => [prev[0], { ...prev[1], email: viewingUserObj.email }]);
      }
    });
    get(`/api/useritems`, { userid: userId }).then((userItemsObj) => setUserItems(userItemsObj));
  }, [userId]);

  const user = userandinformation[0];
  const userinformation = userandinformation[1];

  const handleImageUpload = async (event, type) => {
    const files = Array.from(event.target.files);
    const imagePromises = files.map((file) => {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.readAsDataURL(file);
      });
    });

    const base64Images = await Promise.all(imagePromises);
    if (type === "profile") {
      setNewPicture((prev) => ({
        ...prev,
        picture: base64Images,
      }));
    } else if (type === "background") {
      setNewBackground((prev) => ({
        ...prev,
        picture: base64Images,
      }));
    }
  };

  const handleDeleteImage = (type) => {
    if (type === "profile") {
      setNewPicture({ picture: [defaultpfpimg] });
    } else if (type === "background") {
      setNewBackground({ picture: [backgroundimg] });
    }
  };

  const saveEdits = async () => {
    setIsSaving(true);
    const newDescription = document.getElementById("Description-input").value;
    const newEmail = document.getElementById("Email-input").value;
    const newPhone = document.getElementById("Phone-input").value;
    
    let newPictureObj = newPicture.picture;
    if (newPictureObj[0] === defaultpfpimg && userinformation?.picture) {
      newPictureObj = [userinformation.picture];
    }

    let newBackgroundObj = newBackground.picture;
    if (newBackgroundObj[0] === backgroundimg && userinformation?.backgroundImage) {
      newBackgroundObj = [userinformation.backgroundImage];
    }

    const body = {
      userid: userId,
      description: newDescription,
      email: newEmail,
      phone: newPhone,
      picture: newPictureObj[0],
      backgroundImage: newBackgroundObj[0],
      rating: userinformation.rating,
    };

    try {
      const profile = await post("/api/edituser", body);
      setUser([user, profile]);
      setShowEditForm(false);
    } catch (error) {
      setIsLoading(false);
      setError("Failed to save changes. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const displayAllItems = () => {
    window.location.href = `/UserAllItems/${userId}`;
  };

  const handleOrderClick = (orderId, e) => {
    e.preventDefault();
    navigate(`/OrderDetails/${orderId}`);
  };

  if (isLoading || !user) {
    return <div>Loading...</div>;
  }

  let editVisible = user._id === viewingUser?._id;

  const backgroundStyle = {
    backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.3)), url(${
      userinformation?.backgroundImage || backgroundimg
    })`,
  };

  const handleModalClick = (e) => {
    if (e.target.className === "Profile-modal") {
      setShowEditForm(false);
    }
  };

  return (
    <div className="Profile-container">
      <div className="Profile-background" style={backgroundStyle} />
      <div className="Profile-content">
        <div className="Profile-avatarContainer">
          <img
            className="Profile-avatar"
            src={userinformation?.picture || defaultpfpimg}
            alt={`${user.name}'s profile`}
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = defaultpfpimg;
            }}
          />
        </div>

        <div className="Profile-info">
          <h1 className="Profile-name">{user.name}</h1>
          {editVisible && (
            <button className="Profile-editText" onClick={() => setShowEditForm(true)}>
              Edit Profile
            </button>
          )}
          <div className="Profile-details">
            <div className="Profile-detail">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                <polyline points="22,6 12,13 2,6" />
              </svg>
              <a href={`mailto:${userinformation?.email}`} className="Profile-email">
                {userinformation?.email}
              </a>
            </div>
            <div className="Profile-detail">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
              </svg>
              <a href={`tel:${userinformation?.phone}`} className="Profile-phone">
                {userinformation?.phone || "No phone number"}
              </a>
            </div>
            <Link to={`/UserReviews/${userId}`} className="Profile-detail">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>
              <div className="Profile-rating">
                {userinformation?.rating
                  ? `${Number(userinformation.rating[0]).toFixed(1)} (${
                      userinformation.rating[1]
                    } reviews)`
                  : "No reviews yet"}
              </div>
            </Link>
          </div>
        </div>

        {showEditForm && (
          <div className="Profile-modal" onClick={handleModalClick}>
            <div className="Profile-editForm" onClick={(e) => e.stopPropagation()}>
              <button className="Profile-closeButton" onClick={() => setShowEditForm(false)}>
                ×
              </button>
              <h2>Edit Profile</h2>
              <div className="Profile-formGroup">
                <label>Profile Picture</label>
                <div className="Profile-imageControls">
                  <input
                    type="file"
                    id="Picture-input"
                    name="image"
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e, "profile")}
                  />
                </div>
                {newPicture.picture[0] && newPicture.picture[0] !== defaultpfpimg && (
                  <div className="Profile-imageWrapper">
                    <img src={newPicture.picture[0]} alt="Preview" className="Profile-previewImage" />
                    <div className="Profile-imageActions">
                      <button
                        type="button"
                        onClick={() => handleDeleteImage("profile")}
                        className="Profile-imageAction remove"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                )}
              </div>
              <div className="Profile-formGroup">
                <label>Background Image</label>
                <div className="Profile-imageControls">
                  <input
                    type="file"
                    id="Background-input"
                    name="image"
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e, "background")}
                  />
                </div>
                {newBackground.picture[0] && newBackground.picture[0] !== backgroundimg && (
                  <div className="Profile-imageWrapper">
                    <img src={newBackground.picture[0]} alt="Background Preview" className="Profile-previewImage" />
                    <div className="Profile-imageActions">
                      <button
                        type="button"
                        onClick={() => handleDeleteImage("background")}
                        className="Profile-imageAction remove"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                )}
              </div>
              <div className="Profile-formGroup">
                <label>Description</label>
                <textarea
                  id="Description-input"
                  defaultValue={userinformation?.description}
                  placeholder="Tell us about yourself"
                  rows="4"
                />
              </div>
              <div className="Profile-formGroup">
                <label>Email</label>
                <input
                  type="email"
                  id="Email-input"
                  defaultValue={userinformation?.email}
                  placeholder="Your email"
                />
              </div>
              <div className="Profile-formGroup">
                <label>Phone Number</label>
                <input
                  type="tel"
                  id="Phone-input"
                  defaultValue={userinformation?.phone}
                  placeholder="Your phone number"
                />
              </div>
              <p className="Profile-saveWarning">
                Please wait while your changes are being saved. Do not click multiple times.
              </p>
              <div className="Profile-formButtons">
                <button className="Profile-cancelButton" onClick={() => setShowEditForm(false)} disabled={isSaving}>
                  Cancel
                </button>
                <button className="Profile-saveButton" onClick={saveEdits} disabled={isSaving}>
                  {isSaving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="Profile-section">
          <h2 className="Profile-sectionTitle">About Me</h2>
          <p className="Profile-aboutText">
            {userinformation?.description || "No description provided."}
          </p>
        </div>

        <div className="Profile-section">
          <h2 className="Profile-sectionTitle">
            <Link to={`/UserAllItems/${userId}`} className="Profile-sectionLink">
              My Items
            </Link>
            {userItems.length > 12 && (
              <button onClick={displayAllItems} className="Profile-viewAllButton">
                View All Items
              </button>
            )}
          </h2>
          <div className="Profile-itemsGrid">
            {isLoading ? (
              <div className="Loading-spinner">Loading items...</div>
            ) : userItems.length === 0 ? (
              <p>No items listed yet</p>
            ) : (
              userItems.slice(0, 12).map((item) => (
                <a
                  key={item._id}
                  href="#"
                  onClick={(e) => handleOrderClick(item._id, e)}
                  className="Profile-itemCard"
                >
                  <img src={item.images[0]} alt={item.name} className="Profile-itemImage" />
                </a>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
