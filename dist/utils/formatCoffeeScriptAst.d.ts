import { Base as CS1Base } from 'decaffeinate-coffeescript/lib/coffee-script/nodes';
import { Base as CS2Base } from 'decaffeinate-coffeescript2/lib/coffeescript/nodes';
import CodeContext from './CodeContext';
export default function formatCoffeeScriptAst(program: CS1Base | CS2Base, context: CodeContext): string;
