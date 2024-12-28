export const getAllRooms = async () => {
  try {
    const response = await fetch(`/api/rooms`);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error("Error fetching rooms", error);
    throw error;
  }
};
