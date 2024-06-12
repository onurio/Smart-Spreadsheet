import type { MetaFunction } from "@remix-run/node";
import FileUpload from "~/components/FileUpload";

export const meta: MetaFunction = () => {
  return [{ title: "Excel AI Chat" }, { name: "description", content: "hi!" }];
};

export default function Index() {
  return (
    <div style={{ fontFamily: "system-ui, sans-serif", lineHeight: "1.8" }}>
      Upload a excel
      <FileUpload />
    </div>
  );
}
