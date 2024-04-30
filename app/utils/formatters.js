export function formatDate(dateString) {
    // Create a Date object from the ISO 8601 string
    const dateObj = new Date(dateString);

    // Function to add leading zeros for single-digit day or month
    function pad(num) {
        return String(num).padStart(2, '0');
    }

    // Extract day, month, and year components
    const day = pad(dateObj.getDate());
    const month = pad(dateObj.getMonth() + 1); // Months are zero-indexed (January = 0)
    const year = dateObj.getFullYear();

    // Format the date in dd-mm-yyyy
    const formattedDate = `${day}-${month}-${year}`;
    return formattedDate;
}
