import { initialCards } from "../scripts/cards.js";
import "./index.css";
import {
  enableValidation,
  settings,
  resetValidation,
  disabledButton,
} from "../scripts/validation.js";
import Api from "../utils/Api.js";

function showErrorMessage(message) {
  const errorElement = document.querySelector("#error-message");
  errorElement.textContent = message;
  errorElement.classList.add("error-message_visible");

  // Hide the error message after 3 seconds
  setTimeout(() => {
    errorElement.classList.remove("error-message_visible");
  }, 3000);
}

let userId; // Add this line after the imports

const api = new Api({
  baseUrl: "https://around-api.en.tripleten-services.com/v1",
  headers: {
    authorization: "323fccdf-3cbc-475e-8d4f-bbab4147d0ed",
    "Content-Type": "application/json",
  },
});

const avatarImage = document.querySelector(".profile__avatar");
const profileName = document.querySelector(".profile__name");
const profileDescription = document.querySelector(".profile__description");

api
  .getAppInfo()
  .then(([user, cards]) => {
    userId = user._id; // Changed from 'let userId = user._id'
    cards.forEach((item) => {
      const cardElement = getCardElement(item);
      cardsList.append(cardElement);
    });

    avatarImage.src = user.avatar;
    profileName.textContent = user.name;
    profileDescription.textContent = user.about;
  })
  .catch((err) => {
    showErrorMessage("Something went wrong. Please try again later.");
  });

const profileEditButton = document.querySelector(".profile__edit-btn");
const profileAddButton = document.querySelector(".profile__add-btn");
const avatarModalBtn = document.querySelector(".profile__avatar-btn");

const editModal = document.querySelector("#edit-modal");
const editFormElement = editModal.querySelector(".modal__form");
const editModalCloseButton = editModal.querySelector(".modal__close-btn");
const editModalNameInput = editModal.querySelector("#profile-name-input");
const editModalDescriptionInput = editModal.querySelector(
  "#profile-description-input"
);

const avatarModal = document.querySelector("#avatar-modal");
const avatarFormElement = avatarModal.querySelector("#edit-avatar-form");
const avatarModalCloseButton = avatarModal.querySelector(".modal__close-btn");
const avatarSubmitBtn = avatarModal.querySelector(".modal__submit-btn");
const avatarInput = avatarModal.querySelector("#profile-avatar-input");

const deleteModal = document.querySelector("#delete-modal");
const deleteForm = document.querySelector("#delete-form");
const deleteCancelButton = deleteForm.querySelector('button[type="button"]');

const cardTemplate = document.querySelector("#card-template");
const cardsList = document.querySelector(".cards__list");
const cardModal = document.querySelector("#add-card-modal");
const cardForm = cardModal.querySelector(".modal__form");
const cardSubmitBtn = cardModal.querySelector(".modal__submit-btn");
const cardModalCloseBtn = cardModal.querySelector(".modal__close-btn");
const cardNameInput = cardModal.querySelector("#add-card-name-input");
const cardLinkInput = cardModal.querySelector("#add-card-link-input");

const previewModal = document.querySelector("#preview-modal");
const previewModalImageEl = previewModal.querySelector(".modal__image");
const previewModalCaptionEl = previewModal.querySelector(".modal__caption");
const previewModalCloseBtn = previewModal.querySelector(".modal__close-btn");

const closeButtons = document.querySelectorAll(".modal__close-btn");

closeButtons.forEach((button) => {
  const popup = button.closest(".modal");
  button.addEventListener("click", () => closeModal(popup));
});

editModal.addEventListener("click", (evt) => {
  if (evt.target === editModal) {
    closeModal(editModal);
  }
});

cardModal.addEventListener("click", (evt) => {
  if (evt.target === cardModal) {
    closeModal(cardModal);
  }
});

previewModal.addEventListener("click", (evt) => {
  if (evt.target === previewModal) {
    closeModal(previewModal);
  }
});

avatarModal.addEventListener("click", (evt) => {
  if (evt.target === avatarModal) {
    closeModal(avatarModal);
  }
});

deleteModal.addEventListener("click", (evt) => {
  if (evt.target === deleteModal) {
    closeModal(deleteModal);
  }
});

function getCardElement(data) {
  const cardElement = cardTemplate.content
    .querySelector(".card")
    .cloneNode(true);
  cardElement.id = data._id;
  cardElement.dataset.cardId = data._id;

  const cardNameEl = cardElement.querySelector(".card__title");
  const cardImageEl = cardElement.querySelector(".card__image");
  const likeButton = cardElement.querySelector(".card__like-btn");
  const likeCount = cardElement.querySelector(".card__like-count");
  // Check if card is liked by current user
  let isLiked = data.isLiked;

  // Set initial like button state
  if (isLiked) {
    likeButton.classList.add("card__like-btn_liked");
  }

  // Set initial like count
  // likeCount.textContent = data.likes.length;

  cardNameEl.textContent = data.name;
  cardImageEl.src = data.link;
  cardImageEl.alt = data.name;

  likeButton.addEventListener("click", () => {
    api
      .handleLike(data._id, isLiked)
      .then((updatedCard) => {
        if (updatedCard) {
          isLiked = !isLiked;
          likeButton.classList.toggle("card__like-btn_liked");
          likeCount.textContent = updatedCard.likes
            ? updatedCard.likes.length
            : 0;
        }
      })
      .catch((err) => {
        console.error(err);
        showErrorMessage("Unable to update like. Please try again.");
      });
  });

  cardImageEl.addEventListener("click", () => {
    openModal(previewModal);
    previewModalImageEl.src = data.link;
    previewModalImageEl.alt = data.name;
    previewModalCaptionEl.textContent = data.name;
  });

  const deleteButton = cardElement.querySelector(".card__delete-btn");
  deleteButton.addEventListener("click", () => {
    openModal(deleteModal);
    // Store the card element to be deleted
    deleteModal.dataset.cardToDelete = deleteButton.closest(".card").id;
  });

  return cardElement;
}

function handleEscape(evt) {
  if (evt.key === "Escape") {
    const openedPopup = document.querySelector(".modal_opened");
    closeModal(openedPopup);
  }
}

function openModal(modal) {
  modal.classList.add("modal_opened");
  document.addEventListener("keydown", handleEscape);
}

function closeModal(modal) {
  modal.classList.remove("modal_opened");
  document.removeEventListener("keydown", handleEscape);
}

function handleEditFormSubmit(evt) {
  evt.preventDefault();
  const submitButton = editFormElement.querySelector(".modal__submit-btn");
  const originalText = submitButton.textContent;

  submitButton.textContent = "Saving...";
  submitButton.disabled = true;

  api
    .editUserInfo({
      name: editModalNameInput.value,
      about: editModalDescriptionInput.value,
    })
    .then((data) => {
      profileName.textContent = data.name;
      profileDescription.textContent = data.about;
      closeModal(editModal);
    })
    .catch((err) => {
      showErrorMessage("Unable to update profile. Please try again.");
      submitButton.disabled = false;
    })
    .finally(() => {
      submitButton.textContent = originalText;
    });
}

function handleAddCardSubmit(evt) {
  evt.preventDefault();
  const submitButton = cardSubmitBtn;
  const originalText = submitButton.textContent;

  submitButton.textContent = "Saving...";
  submitButton.disabled = true;

  api
    .addCard({
      name: cardNameInput.value,
      link: cardLinkInput.value,
    })
    .then((cardData) => {
      const cardElement = getCardElement(cardData);
      cardsList.prepend(cardElement);
      cardForm.reset();
      disabledButton(cardSubmitBtn, settings);
      closeModal(cardModal);
    })
    .catch((err) => {
      showErrorMessage("Unable to add card. Please try again.");
      submitButton.disabled = false;
    })

    .finally(() => {
      submitButton.textContent = originalText;
    });
}

function handleAvatarSubmit(evt) {
  evt.preventDefault();
  const submitButton = avatarSubmitBtn;
  const originalText = submitButton.textContent;

  submitButton.textContent = "Saving...";
  submitButton.disabled = true;

  api
    .editAvatarInfo(avatarInput.value)
    .then((data) => {
      avatarImage.src = data.avatar;
      closeModal(avatarModal);
      avatarFormElement.reset();
      disabledButton(avatarSubmitBtn, settings);
    })
    .catch((err) => {
      showErrorMessage("Unable to update avatar. Please try again.");
      submitButton.disabled = false;
    })
    .finally(() => {
      submitButton.textContent = originalText;
    });
}

profileEditButton.addEventListener("click", () => {
  editModalNameInput.value = profileName.textContent;
  editModalDescriptionInput.value = profileDescription.textContent;
  resetValidation(
    editFormElement,
    [editModalNameInput, editModalDescriptionInput],
    settings
  );
  openModal(editModal);
});

profileAddButton.addEventListener("click", () => {
  openModal(cardModal);
});

avatarModalBtn.addEventListener("click", () => {
  openModal(avatarModal);
});

editFormElement.addEventListener("submit", handleEditFormSubmit);
cardForm.addEventListener("submit", handleAddCardSubmit);

avatarFormElement.addEventListener("submit", handleAvatarSubmit);

deleteForm.addEventListener("submit", (evt) => {
  evt.preventDefault();
  const submitButton = deleteForm.querySelector(".modal__submit-btn-delete");

  // Add this check
  if (!submitButton) {
    console.error("Submit button not found");
    return;
  }

  const originalText = submitButton.textContent;
  submitButton.textContent = "Deleting...";
  submitButton.disabled = true;

  const cardId = deleteModal.dataset.cardToDelete;
  api
    .deleteCard(cardId)
    .then(() => {
      const cardToDelete = document.getElementById(cardId);
      if (cardToDelete) {
        cardToDelete.remove();
      }
      closeModal(deleteModal);
    })
    .catch((err) => {
      showErrorMessage("Unable to delete card. Please try again.");
      submitButton.disabled = false;
    })
    .finally(() => {
      submitButton.textContent = originalText;
    });
});

deleteCancelButton.addEventListener("click", () => {
  closeModal(deleteModal);
});

enableValidation(settings);
