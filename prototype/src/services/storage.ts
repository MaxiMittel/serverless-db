import {
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { environment } from "../environment";

export class StorageService {
  client: S3Client;

  constructor() {
    this.client = new S3Client({ region: environment.REGION });
  }

  async readBytes(key: string, offset: number, length: number) {
    const params = {
      Bucket: environment.BUCKET_NAME,
      Key: key,
      Range: `bytes=${offset}-${offset + length - 1}`,
    };

    const result = await this.client.send(new GetObjectCommand(params));
    return result.Body;
  }

  async readObject(key: string) {
    const params = {
      Bucket: environment.BUCKET_NAME,
      Key: key,
    };

    const result = await this.client.send(new GetObjectCommand(params));
    return result.Body;
  }

  async writeObject(key: string, data: Uint8Array) {
    const params = {
      Bucket: environment.BUCKET_NAME,
      Key: key,
      Body: data,
    };

    const result = await this.client.send(new PutObjectCommand(params));
    return result;
  }

  // Append data to the end of the file and return the offset
  async append(key: string, data: Uint8Array) {
    const content = await this.readObject(key);
    const buffer = await this.streamToBuffer(content);
    const result = Buffer.concat([buffer, data]);
    await this.writeObject(key, result);

    return buffer.length;
  }

  async writeBytes(key: string, start: number, end: number, data: Buffer) {
    const content = await this.readObject(key);
    const buffer = await this.streamToBuffer(content);

    // Replace the bytes in the buffer
    for (let i = start; i < end; i++) {
      buffer[i] = data[i - start];
    }

    await this.writeObject(key, buffer);
  }

  async deleteBytes(key: string, start: number, end: number) {
    const content = await this.readObject(key);
    const buffer = await this.streamToBuffer(content);

    // Replace bytes with null
    for (let i = start; i < end; i++) {
      buffer[i] = 0;
    }

    await this.writeObject(key, buffer);
  }

  async objectExists(key: string) {
    try {
      await this.client.send(
        new GetObjectCommand({ Bucket: environment.BUCKET_NAME, Key: key })
      );
      return true;
    } catch (e) {
      return false;
    }
  }

  streamToString(stream: any): Promise<string> {
    return new Promise((resolve, reject) => {
      const chunks: any[] = [];
      stream.on("data", (chunk: any) => chunks.push(chunk));
      stream.on("error", reject);
      stream.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
    });
  }

  streamToBuffer(stream: any): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const chunks: any[] = [];
      stream.on("data", (chunk: any) => chunks.push(chunk));
      stream.on("error", reject);
      stream.on("end", () => resolve(Buffer.concat(chunks)));
    });
  }
}
