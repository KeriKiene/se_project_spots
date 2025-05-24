import { initialCards } from "../scripts/cards.js";
import "./index.css";
import {
  enableValidation,
  settings,
  resetValidation,
  disabledButton,
} from "../scripts/validation.js";
import Api from "../utils/Api.js";

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
    console.log(cards);
    cards.forEach((item) => {
      const cardElement = getCardElement(item);
      cardsList.append(cardElement);
    });

    avatarImage.src = user.avatar;
    profileName.textContent = user.name;
    profileDescription.textContent = user.about;
  })

  .catch((err) => {
    console.error(err);
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

/*previewModalCloseBtn.addEventListener("click", () => {
  closeModal(previewModal);
});*/

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

function getCardElement(data) {
  const cardElement = cardTemplate.content
    .querySelector(".card")
    .cloneNode(true);
  cardElement.id = data._id;
  cardElement.dataset.cardId = data._id;

  const cardNameEl = cardElement.querySelector(".card__title");
  const cardImageEl = cardElement.querySelector(".card__image");
  const cardLikeBtn = cardElement.querySelector(".card__like-btn");

  cardNameEl.textContent = data.name;
  cardImageEl.src = data.link;
  cardImageEl.alt = data.name;

  cardLikeBtn.addEventListener("click", () => {
    cardLikeBtn.classList.toggle("card__like-btn_liked");
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
    .catch(console.error);
}

function handleAddCardSubmit(evt) {
  evt.preventDefault();
  cardSubmitBtn.disabled = true; // Disable the button while submitting

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
    .catch(console.error)
    .finally(() => {
      cardSubmitBtn.disabled = false; // Re-enable the button
    });
}

// function handleAddCardSubmit(evt) {
//   evt.preventDefault();
//   const inputValues = { name: cardNameInput.value, link: cardLinkInput.value };
//   const cardElement = getCardElement(inputValues);
//   cardsList.prepend(cardElement);
//   cardForm.reset();
//   disabledButton(cardSubmitBtn, settings);
//   closeModal(cardModal);
// }

function handleAvatarSubmit(evt) {
  evt.preventDefault();
  avatarSubmitBtn.disabled = true;
  api
    .editAvatarInfo(avatarInput.value)
    .then((data) => {
      avatarImage.src = data.avatar;
      closeModal(avatarModal);
      avatarFormElement.reset();
    })
    .catch((err) => {
      console.error(err);
    })
    .finally(() => {
      avatarSubmitBtn.disabled = false;
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
  console.log("Delete form submitted");
  evt.preventDefault();
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
      console.error(err);
    });
});

deleteCancelButton.addEventListener("click", () => {
  console.log("Cancel button clicked");
  closeModal(deleteModal);
});

enableValidation(settings);
