// ============================================
// User Tools Types & Storage
// ============================================

export interface UserToolItem {
  id: string;
  icon: string;
  title: string;
  description: string;
  url: string;
  openNewWindow: boolean;
}

export interface UserCard {
  id: string;
  title: string;
  items: UserToolItem[];
}

export const USER_CARDS_KEY = 'user-tool-cards';

// Generate unique ID
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

// Get all user cards from localStorage
export function getUserCards(): UserCard[] {
  try {
    return JSON.parse(localStorage.getItem(USER_CARDS_KEY) || '[]');
  } catch {
    return [];
  }
}

// Save user cards to localStorage
export function saveUserCards(cards: UserCard[]): void {
  localStorage.setItem(USER_CARDS_KEY, JSON.stringify(cards));
}

// Add a new card
export function addCard(title: string): UserCard {
  const cards = getUserCards();
  const newCard: UserCard = {
    id: generateId(),
    title,
    items: [],
  };
  cards.push(newCard);
  saveUserCards(cards);
  return newCard;
}

// Update a card
export function updateCard(cardId: string, title: string): UserCard | null {
  const cards = getUserCards();
  const card = cards.find((c) => c.id === cardId);
  if (card) {
    card.title = title;
    saveUserCards(cards);
    return card;
  }
  return null;
}

// Delete a card
export function deleteCard(cardId: string): boolean {
  const cards = getUserCards();
  const index = cards.findIndex((c) => c.id === cardId);
  if (index !== -1) {
    cards.splice(index, 1);
    saveUserCards(cards);
    return true;
  }
  return false;
}

// Add an item to a card
export function addItem(cardId: string, item: Omit<UserToolItem, 'id'>): UserToolItem | null {
  const cards = getUserCards();
  const card = cards.find((c) => c.id === cardId);
  if (card) {
    const newItem: UserToolItem = {
      ...item,
      id: generateId(),
    };
    card.items.push(newItem);
    saveUserCards(cards);
    return newItem;
  }
  return null;
}

// Update an item
export function updateItem(
  cardId: string,
  itemId: string,
  updates: Partial<Omit<UserToolItem, 'id'>>
): UserToolItem | null {
  const cards = getUserCards();
  const card = cards.find((c) => c.id === cardId);
  if (card) {
    const item = card.items.find((i) => i.id === itemId);
    if (item) {
      Object.assign(item, updates);
      saveUserCards(cards);
      return item;
    }
  }
  return null;
}

// Delete an item
export function deleteItem(cardId: string, itemId: string): boolean {
  const cards = getUserCards();
  const card = cards.find((c) => c.id === cardId);
  if (card) {
    const index = card.items.findIndex((i) => i.id === itemId);
    if (index !== -1) {
      card.items.splice(index, 1);
      saveUserCards(cards);
      return true;
    }
  }
  return false;
}

// Move an item to a different card
export function moveItem(fromCardId: string, toCardId: string, itemId: string): boolean {
  const cards = getUserCards();
  const fromCard = cards.find((c) => c.id === fromCardId);
  const toCard = cards.find((c) => c.id === toCardId);

  if (fromCard && toCard) {
    const itemIndex = fromCard.items.findIndex((i) => i.id === itemId);
    if (itemIndex !== -1) {
      const [item] = fromCard.items.splice(itemIndex, 1);
      toCard.items.push(item);
      saveUserCards(cards);
      return true;
    }
  }
  return false;
}

// Get a specific card by ID
export function getCardById(cardId: string): UserCard | null {
  const cards = getUserCards();
  return cards.find((c) => c.id === cardId) || null;
}

// Get a specific item by ID
export function getItemById(cardId: string, itemId: string): UserToolItem | null {
  const card = getCardById(cardId);
  if (card) {
    return card.items.find((i) => i.id === itemId) || null;
  }
  return null;
}
