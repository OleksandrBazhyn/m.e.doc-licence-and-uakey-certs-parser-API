export async function fetchCompanyData(usreou) {
    const response = await fetch(`/api/company?usreou=${usreou}`);
    if (!response.ok) {
        throw new Error("Failed to fetch data");
    }
    return response.json();
}
