export function getPublicWishPayload(wish) {
  return {
    id: wish._id,
    recipientName: wish.recipientName,
    relation: wish.relation,
    templateId: wish.templateId,
    message: wish.message,
    shayari: wish.shayari,
    theme: wish.theme,
    images: wish.images,
    photoFrameStyle: wish.photoFrameStyle,
    photoTransition: wish.photoTransition,
    music: wish.music,
    voiceMessage: wish.voiceMessage,
    shareSlug: wish.shareSlug,
    ownerName: wish.owner?.name,
    status: wish.status,
    scheduleAt: wish.scheduleAt,
    expiresAt: wish.expiresAt,
    openedAt: wish.openedAt
  };
}
