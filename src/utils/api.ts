import { GroupInterface } from "./interface";

const path = './groups.json';

const getJson = (response: Response): Promise<GroupInterface[]> => {
  if (response.ok) {
    return response.json();
  }
  return response.json().then((err) => {
    throw new Error(err);
  })
}

export const getGroups = (): Promise<GroupInterface[]> =>
  fetch(path).then(getJson);