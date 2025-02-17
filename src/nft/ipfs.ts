import { S3 } from "aws-sdk";
import axios from "axios";
import FormData from "form-data";

export default class IPFS {
    private auth: string;

    constructor(token: string) {
        this.auth = "Bearer " + token;
    }

    public async add(params: any): Promise<string | undefined> {
        try {
            var data = JSON.stringify(params);

            var config = {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: this.auth,
                },
            };

            const res = await axios.post(
                "https://api.pinata.cloud/pinning/pinJSONToIPFS",
                data,
                config,
            );

            return res.data.IpfsHash;
        } catch (err) {
            console.error(err);
            return undefined;
        }
    }

    public async addLink(file: string): Promise<string | undefined> {
        try {
            console.log("addLink", file);
            const auth: string = this.auth;
            const s3 = new S3();

            const params = {
                Bucket: process.env.BUCKET!,
                Key: file,
            };

            let finished: boolean = false;
            const start = Date.now();
            const timeout = 60 * 1000; // 1 min
            let s3data: any = undefined;
            while (!finished) {
                console.log("Waiting for S3", file);
                s3.headObject(params, function (err: any, data: any) {
                    if (err) console.log("S3 is not ready yet");
                    else {
                        finished = true;
                        s3data = data;
                        console.log("S3 is ready", data);
                    }
                });
                if (start + timeout < Date.now()) {
                    console.error("addLink timeout");
                    return undefined;
                }
                await sleep(1000);
            }

            console.log("s3data", s3data);
            if (!s3data) return undefined;

            // Get read object stream
            const s3Stream = s3.getObject(params).createReadStream();
            const formData = new FormData();

            // append stream with a file
            formData.append("file", s3Stream, {
                contentType: s3data.ContentType,
                knownLength: s3data.ContentLength,
                filename: file,
            });

            const response = await axios.post(
                "https://api.pinata.cloud/pinning/pinFileToIPFS",
                formData,
                {
                    headers: {
                        Authorization: auth,
                        ...formData.getHeaders(),
                    },
                    maxBodyLength: 25 * 1024 * 1024,
                },
            );

            console.log("addLink result:", response.data);
            if (response && response.data && response.data.IpfsHash) {
                return response.data.IpfsHash;
            } else {
                console.error("addLink error", response.data.error);
                return undefined;
            }
            /*
          .then((response) => {
            console.log("addLink result:", response.data);
            if (response && response.data && response.data.IpfsHash) {
              return response.data.IpfsHash;
            } else {
              console.error("addLink error", response.data.error);
              return undefined;
            }
          })
          .catch((e: any) => {
            console.error("addLink error - catch", e);
            return undefined;
          });
          */
            //});
        } catch (err) {
            console.error("addLink error 2 - catch", err);
            return undefined;
        }
        return undefined;
    }
}

function sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

/*
// NFTStorage raises errors in AWS Lambda environment - needs to be replaced
import { NFTStorage, Blob } from "nft.storage";
import axios from "axios";

export default class IPFS {
  private storage: NFTStorage;

  constructor(token: string) {
    this.storage = new NFTStorage({ token });
  }

  public async add(file: any): Promise<string | undefined> {
    try {
      const data = new Blob([JSON.stringify(file)]);
      const cid = await this.storage.storeBlob(data);
      return cid;
    } catch (err) {
      console.error(err);
      return undefined;
    }
  }

  public async addLink(file: any): Promise<string | undefined> {
    try {
      console.log("addLink", file);
      let response = await axios.get(file, {
        responseType: "arraybuffer",
      });
      console.log("addLink data:", response.data ? "yes" : "no");
      //console.log("addLink response", response);
      const data = Buffer.from(response.data, "binary");
      const { cid, car } = await NFTStorage.encodeBlob(new Blob([data]));
      console.log(`addLink CID: ${cid}`);

      await this.storage.storeCar(car, {
        onStoredChunk: (size) =>
          console.log(
            `Stored a chunk of ${size} bytes to https://ipfs.io/ipfs/${cid}`,
          ),
      });
      return `${cid}`;
    } catch (err) {
      console.error(err);
      return undefined;
    }
  }
}
*/
