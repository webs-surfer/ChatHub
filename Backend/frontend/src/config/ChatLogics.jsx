export function getSender(loggedUser, users) {
  if (!loggedUser || !users || users.length === 0) return "";
  return users.find((u) => u?._id !== loggedUser?._id)?.name || "";
}

export function getSenderFull(loggedUser, users) {
  if (!loggedUser || !users) return {};
  return users[0]._id === loggedUser._id ? users[1] : users[0];
}
