export function getPublicWishPayload(wish) {
  return {
    id: wish._id,
    recipientName: wish.recipientName,
    relation: wish.relation,
    message: wish.message,
    shayari: wish.shayari,
    theme: wish.theme,
    images: wish.images,
    music: wish.music,
    voiceMessage: wish.voiceMessage,
    shareSlug: wish.shareSlug,
    ownerName: wish.owner?.name,
    expiresAt: wish.expiresAt,
    openedAt: wish.openedAt
  };
}
