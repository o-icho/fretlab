import { StringComparison } from "@/features/strings/StringComparison";
import { stringTools } from "@/features/strings/pages";
import { pageMetadata } from "@/lib/metadata";
import { StringToolPage } from "../StringToolPage";

const tool = stringTools.comparer;
export const metadata = pageMetadata(tool.title, tool.description, tool.href);

export default function Page() {
  return <StringToolPage tool="comparer"><StringComparison /></StringToolPage>;
}
