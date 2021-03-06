import SourceTokenList from 'coffee-lex/dist/SourceTokenList';
import { Block } from 'decaffeinate-coffeescript2/lib/coffeescript/nodes';
import { Node, Program } from 'decaffeinate-parser/dist/nodes';
import LinesAndColumns from 'lines-and-columns';
import Scope from './Scope';
/**
 * Class that provides access to various useful things to know about
 * CoffeeScript source code, particularly the decaffeinate-parser AST.
 */
export default class DecaffeinateContext {
    readonly programNode: Program;
    readonly source: string;
    readonly sourceTokens: SourceTokenList;
    readonly coffeeAST: Block;
    readonly linesAndColumns: LinesAndColumns;
    private readonly parentMap;
    private readonly scopeMap;
    constructor(programNode: Program, source: string, sourceTokens: SourceTokenList, coffeeAST: Block, linesAndColumns: LinesAndColumns, parentMap: Map<Node, Node | null>, scopeMap: Map<Node, Scope>);
    static create(source: string, useCS2: boolean): DecaffeinateContext;
    getParent(node: Node): Node | null;
    getScope(node: Node): Scope;
}
