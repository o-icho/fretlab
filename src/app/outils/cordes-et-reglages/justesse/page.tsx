import { IntonationCheck } from "@/features/tuner/components/IntonationCheck";
import { stringTools } from "@/features/strings/pages";
import { pageMetadata } from "@/lib/metadata";
import { StringToolPage } from "../StringToolPage";

const tool = stringTools.justesse;
export const metadata = pageMetadata(tool.title, tool.description, tool.href);

export default function Page() {
  return <StringToolPage tool="justesse"><IntonationCheck /></StringToolPage>;
}
