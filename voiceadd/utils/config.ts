export const getConfigFromAPI = async (filename: string): Promise<string> => {
  const response = await fetch(`/api/config?filename=${filename}`);
  const data = await response.json();
  if (response.ok) {
    return data.content;
  } else {
    throw new Error(data.error);
  }
};
