import axios from "axios";
export const createGuest = async (): Promise<string | undefined> => {
    try {
      const server = process.env.REACT_APP_API_BASE_URL;
      if (!server) {
        throw new Error('API base URL is not defined');
      }
      const res = await axios.post(`${server}/api/guests`);
      if(res.status === 201 && res.data){
        const guestId: string = res.data.guestId;
        return guestId;
      }
      else{
        console.log("Error creating guest");
      }
    } catch (error) {
      console.error('Error creating guest', error);
      return undefined;
    }
  };
  