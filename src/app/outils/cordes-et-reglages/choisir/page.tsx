import { StringChooser } from "@/features/strings/StringChooser";
import { stringTools } from "@/features/strings/pages";
import { pageMetadata } from "@/lib/metadata";
import { StringToolPage } from "../StringToolPage";

const tool = stringTools.choisir;
export const metadata = pageMetadata(tool.title, tool.description, tool.href);

export default function Page() {
  return <StringToolPage tool="choisir"><StringChooser /></StringToolPage>;
}
