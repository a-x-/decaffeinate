"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var TransformCoffeeScriptStage_1 = require("../TransformCoffeeScriptStage");
var PassthroughPatcher_1 = require("./../../patchers/PassthroughPatcher");
var ArrayInitialiserPatcher_1 = require("./patchers/ArrayInitialiserPatcher");
var AssignOpPatcher_1 = require("./patchers/AssignOpPatcher");
var AsyncFunctionPatcher_1 = require("./patchers/AsyncFunctionPatcher");
var AwaitPatcher_1 = require("./patchers/AwaitPatcher");
var AwaitReturnPatcher_1 = require("./patchers/AwaitReturnPatcher");
var BinaryOpPatcher_1 = require("./patchers/BinaryOpPatcher");
var BlockPatcher_1 = require("./patchers/BlockPatcher");
var BoolPatcher_1 = require("./patchers/BoolPatcher");
var BoundAsyncFunctionPatcher_1 = require("./patchers/BoundAsyncFunctionPatcher");
var BoundFunctionPatcher_1 = require("./patchers/BoundFunctionPatcher");
var BoundGeneratorFunctionPatcher_1 = require("./patchers/BoundGeneratorFunctionPatcher");
var BreakPatcher_1 = require("./patchers/BreakPatcher");
var ChainedComparisonOpPatcher_1 = require("./patchers/ChainedComparisonOpPatcher");
var ClassAssignOpPatcher_1 = require("./patchers/ClassAssignOpPatcher");
var ClassPatcher_1 = require("./patchers/ClassPatcher");
var CompoundAssignOpPatcher_1 = require("./patchers/CompoundAssignOpPatcher");
var ConditionalPatcher_1 = require("./patchers/ConditionalPatcher");
var ConstructorPatcher_1 = require("./patchers/ConstructorPatcher");
var ContinuePatcher_1 = require("./patchers/ContinuePatcher");
var CSXElementPatcher_1 = require("./patchers/CSXElementPatcher");
var DefaultParamPatcher_1 = require("./patchers/DefaultParamPatcher");
var DoOpPatcher_1 = require("./patchers/DoOpPatcher");
var DynamicMemberAccessOpPatcher_1 = require("./patchers/DynamicMemberAccessOpPatcher");
var ElisionPatcher_1 = require("./patchers/ElisionPatcher");
var EqualityPatcher_1 = require("./patchers/EqualityPatcher");
var ExistsOpCompoundAssignOpPatcher_1 = require("./patchers/ExistsOpCompoundAssignOpPatcher");
var ExistsOpPatcher_1 = require("./patchers/ExistsOpPatcher");
var ExpansionPatcher_1 = require("./patchers/ExpansionPatcher");
var ExpOpPatcher_1 = require("./patchers/ExpOpPatcher");
var ExportAllDeclarationPatcher_1 = require("./patchers/ExportAllDeclarationPatcher");
var ExportBindingsDeclarationPatcher_1 = require("./patchers/ExportBindingsDeclarationPatcher");
var ExportDefaultDeclarationPatcher_1 = require("./patchers/ExportDefaultDeclarationPatcher");
var ExportNamedDeclarationPatcher_1 = require("./patchers/ExportNamedDeclarationPatcher");
var ExtendsOpPatcher_1 = require("./patchers/ExtendsOpPatcher");
var FloorDivideOpCompoundAssignOpPatcher_1 = require("./patchers/FloorDivideOpCompoundAssignOpPatcher");
var FloorDivideOpPatcher_1 = require("./patchers/FloorDivideOpPatcher");
var ForFromPatcher_1 = require("./patchers/ForFromPatcher");
var ForInPatcher_1 = require("./patchers/ForInPatcher");
var ForOfPatcher_1 = require("./patchers/ForOfPatcher");
var FunctionApplicationPatcher_1 = require("./patchers/FunctionApplicationPatcher");
var FunctionPatcher_1 = require("./patchers/FunctionPatcher");
var GeneratorFunctionPatcher_1 = require("./patchers/GeneratorFunctionPatcher");
var HeregexPatcher_1 = require("./patchers/HeregexPatcher");
var IdentifierPatcher_1 = require("./patchers/IdentifierPatcher");
var ImportDeclarationPatcher_1 = require("./patchers/ImportDeclarationPatcher");
var IncrementDecrementPatcher_1 = require("./patchers/IncrementDecrementPatcher");
var InOpPatcher_1 = require("./patchers/InOpPatcher");
var InstanceofOpPatcher_1 = require("./patchers/InstanceofOpPatcher");
var JavaScriptPatcher_1 = require("./patchers/JavaScriptPatcher");
var LogicalNotOpPatcher_1 = require("./patchers/LogicalNotOpPatcher");
var LogicalOpCompoundAssignOpPatcher_1 = require("./patchers/LogicalOpCompoundAssignOpPatcher");
var LogicalOpPatcher_1 = require("./patchers/LogicalOpPatcher");
var MemberAccessOpPatcher_1 = require("./patchers/MemberAccessOpPatcher");
var ModuleSpecifierPatcher_1 = require("./patchers/ModuleSpecifierPatcher");
var ModuloOpCompoundAssignOpPatcher_1 = require("./patchers/ModuloOpCompoundAssignOpPatcher");
var ModuloOpPatcher_1 = require("./patchers/ModuloOpPatcher");
var NewOpPatcher_1 = require("./patchers/NewOpPatcher");
var ObjectInitialiserMemberPatcher_1 = require("./patchers/ObjectInitialiserMemberPatcher");
var ObjectInitialiserPatcher_1 = require("./patchers/ObjectInitialiserPatcher");
var OfOpPatcher_1 = require("./patchers/OfOpPatcher");
var ProgramPatcher_1 = require("./patchers/ProgramPatcher");
var QuasiPatcher_1 = require("./patchers/QuasiPatcher");
var RangePatcher_1 = require("./patchers/RangePatcher");
var RegexPatcher_1 = require("./patchers/RegexPatcher");
var RestPatcher_1 = require("./patchers/RestPatcher");
var ReturnPatcher_1 = require("./patchers/ReturnPatcher");
var SeqOpPatcher_1 = require("./patchers/SeqOpPatcher");
var SlicePatcher_1 = require("./patchers/SlicePatcher");
var SoakedDynamicMemberAccessOpPatcher_1 = require("./patchers/SoakedDynamicMemberAccessOpPatcher");
var SoakedFunctionApplicationPatcher_1 = require("./patchers/SoakedFunctionApplicationPatcher");
var SoakedMemberAccessOpPatcher_1 = require("./patchers/SoakedMemberAccessOpPatcher");
var SoakedNewOpPatcher_1 = require("./patchers/SoakedNewOpPatcher");
var SoakedSlicePatcher_1 = require("./patchers/SoakedSlicePatcher");
var SpreadPatcher_1 = require("./patchers/SpreadPatcher");
var StringPatcher_1 = require("./patchers/StringPatcher");
var SuperPatcher_1 = require("./patchers/SuperPatcher");
var SwitchCasePatcher_1 = require("./patchers/SwitchCasePatcher");
var SwitchPatcher_1 = require("./patchers/SwitchPatcher");
var TaggedTemplateLiteralPatcher_1 = require("./patchers/TaggedTemplateLiteralPatcher");
var ThisPatcher_1 = require("./patchers/ThisPatcher");
var ThrowPatcher_1 = require("./patchers/ThrowPatcher");
var TryPatcher_1 = require("./patchers/TryPatcher");
var UnaryExistsOpPatcher_1 = require("./patchers/UnaryExistsOpPatcher");
var UnaryMathOpPatcher_1 = require("./patchers/UnaryMathOpPatcher");
var UnaryOpPatcher_1 = require("./patchers/UnaryOpPatcher");
var UnaryTypeofOpPatcher_1 = require("./patchers/UnaryTypeofOpPatcher");
var WhilePatcher_1 = require("./patchers/WhilePatcher");
var YieldFromPatcher_1 = require("./patchers/YieldFromPatcher");
var YieldPatcher_1 = require("./patchers/YieldPatcher");
var YieldReturnPatcher_1 = require("./patchers/YieldReturnPatcher");
var MainStage = /** @class */ (function (_super) {
    tslib_1.__extends(MainStage, _super);
    function MainStage() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    MainStage.prototype.patcherConstructorForNode = function (node) {
        switch (node.type) {
            case 'Identifier':
                return IdentifierPatcher_1.default;
            case 'String':
                return StringPatcher_1.default;
            case 'TaggedTemplateLiteral':
                return TaggedTemplateLiteralPatcher_1.default;
            case 'Int':
            case 'Float':
            case 'Null':
            case 'Undefined':
                return PassthroughPatcher_1.default;
            case 'Break':
                return BreakPatcher_1.default;
            case 'Continue':
                return ContinuePatcher_1.default;
            case 'Quasi':
                return QuasiPatcher_1.default;
            case 'FunctionApplication':
                return FunctionApplicationPatcher_1.default;
            case 'SoakedFunctionApplication':
                return SoakedFunctionApplicationPatcher_1.default;
            case 'MemberAccessOp':
                return MemberAccessOpPatcher_1.default;
            case 'DynamicMemberAccessOp':
                return DynamicMemberAccessOpPatcher_1.default;
            case 'EQOp':
            case 'NEQOp':
            case 'LTOp':
            case 'GTOp':
            case 'LTEOp':
            case 'GTEOp':
                return EqualityPatcher_1.default;
            case 'PostIncrementOp':
            case 'PostDecrementOp':
            case 'PreIncrementOp':
            case 'PreDecrementOp':
                return IncrementDecrementPatcher_1.default;
            case 'ObjectInitialiserMember':
                return ObjectInitialiserMemberPatcher_1.default;
            case 'ObjectInitialiser':
                return ObjectInitialiserPatcher_1.default;
            case 'This':
                return ThisPatcher_1.default;
            case 'Yield':
                return YieldPatcher_1.default;
            case 'YieldFrom':
                return YieldFromPatcher_1.default;
            case 'YieldReturn':
                return YieldReturnPatcher_1.default;
            case 'Await':
                return AwaitPatcher_1.default;
            case 'AwaitReturn':
                return AwaitReturnPatcher_1.default;
            case 'GeneratorFunction':
                return GeneratorFunctionPatcher_1.default;
            case 'Function':
                return FunctionPatcher_1.default;
            case 'BoundFunction':
                return BoundFunctionPatcher_1.default;
            case 'BoundGeneratorFunction':
                return BoundGeneratorFunctionPatcher_1.default;
            case 'AsyncFunction':
                return AsyncFunctionPatcher_1.default;
            case 'BoundAsyncFunction':
                return BoundAsyncFunctionPatcher_1.default;
            case 'Bool':
                return BoolPatcher_1.default;
            case 'Conditional':
                return ConditionalPatcher_1.default;
            case 'ArrayInitialiser':
                return ArrayInitialiserPatcher_1.default;
            case 'Block':
                return BlockPatcher_1.default;
            case 'AssignOp':
                return AssignOpPatcher_1.default;
            case 'DefaultParam':
                return DefaultParamPatcher_1.default;
            case 'CompoundAssignOp':
                switch (node.op) {
                    case 'LogicalAndOp':
                    case 'LogicalOrOp':
                        return LogicalOpCompoundAssignOpPatcher_1.default;
                    case 'ExistsOp':
                        return ExistsOpCompoundAssignOpPatcher_1.default;
                    case 'ModuloOp':
                        return ModuloOpCompoundAssignOpPatcher_1.default;
                    case 'FloorDivideOp':
                        return FloorDivideOpCompoundAssignOpPatcher_1.default;
                    default:
                        return CompoundAssignOpPatcher_1.default;
                }
            case 'Return':
                return ReturnPatcher_1.default;
            case 'PlusOp':
            case 'SubtractOp':
            case 'DivideOp':
            case 'MultiplyOp':
            case 'RemOp':
            case 'BitAndOp':
            case 'BitOrOp':
            case 'BitXorOp':
            case 'LeftShiftOp':
            case 'SignedRightShiftOp':
            case 'UnsignedRightShiftOp':
                return BinaryOpPatcher_1.default;
            case 'ModuloOp':
                return ModuloOpPatcher_1.default;
            case 'Regex':
                return RegexPatcher_1.default;
            case 'Heregex':
                return HeregexPatcher_1.default;
            case 'ExistsOp':
                return ExistsOpPatcher_1.default;
            case 'LogicalAndOp':
            case 'LogicalOrOp':
                return LogicalOpPatcher_1.default;
            case 'LogicalNotOp':
                return LogicalNotOpPatcher_1.default;
            case 'SoakedMemberAccessOp':
                return SoakedMemberAccessOpPatcher_1.default;
            case 'SoakedDynamicMemberAccessOp':
                return SoakedDynamicMemberAccessOpPatcher_1.default;
            case 'ForIn':
                return ForInPatcher_1.default;
            case 'ForFrom':
                return ForFromPatcher_1.default;
            case 'ForOf':
                return ForOfPatcher_1.default;
            case 'While':
                return WhilePatcher_1.default;
            case 'NewOp':
                return NewOpPatcher_1.default;
            case 'SoakedNewOp':
                return SoakedNewOpPatcher_1.default;
            case 'InOp':
                return InOpPatcher_1.default;
            case 'Slice':
                return SlicePatcher_1.default;
            case 'SoakedSlice':
                return SoakedSlicePatcher_1.default;
            case 'Expansion':
                return ExpansionPatcher_1.default;
            case 'Elision':
                return ElisionPatcher_1.default;
            case 'Rest':
                return RestPatcher_1.default;
            case 'Spread':
                return SpreadPatcher_1.default;
            case 'Range':
                return RangePatcher_1.default;
            case 'Throw':
                return ThrowPatcher_1.default;
            case 'UnaryPlusOp':
            case 'UnaryNegateOp':
            case 'BitNotOp':
                return UnaryMathOpPatcher_1.default;
            case 'TypeofOp':
                return UnaryTypeofOpPatcher_1.default;
            case 'DeleteOp':
                return UnaryOpPatcher_1.default;
            case 'UnaryExistsOp':
                return UnaryExistsOpPatcher_1.default;
            case 'ClassProtoAssignOp':
                return ClassAssignOpPatcher_1.default;
            case 'Super':
                return SuperPatcher_1.default;
            case 'Class':
                return ClassPatcher_1.default;
            case 'Constructor':
                return ConstructorPatcher_1.default;
            case 'Try':
                return TryPatcher_1.default;
            case 'Switch':
                return SwitchPatcher_1.default;
            case 'SwitchCase':
                return SwitchCasePatcher_1.default;
            case 'DoOp':
                return DoOpPatcher_1.default;
            case 'Program':
                return ProgramPatcher_1.default;
            case 'InstanceofOp':
                return InstanceofOpPatcher_1.default;
            case 'OfOp':
                return OfOpPatcher_1.default;
            case 'ChainedComparisonOp':
                return ChainedComparisonOpPatcher_1.default;
            case 'SeqOp':
                return SeqOpPatcher_1.default;
            case 'JavaScript':
                return JavaScriptPatcher_1.default;
            case 'FloorDivideOp':
                return FloorDivideOpPatcher_1.default;
            case 'ExpOp':
                return ExpOpPatcher_1.default;
            case 'ExtendsOp':
                return ExtendsOpPatcher_1.default;
            case 'CSXElement':
                return CSXElementPatcher_1.default;
            case 'ExportBindingsDeclaration':
                return ExportBindingsDeclarationPatcher_1.default;
            case 'ExportDefaultDeclaration':
                return ExportDefaultDeclarationPatcher_1.default;
            case 'ExportAllDeclaration':
                return ExportAllDeclarationPatcher_1.default;
            case 'ModuleSpecifier':
                return ModuleSpecifierPatcher_1.default;
            case 'ImportDeclaration':
                return ImportDeclarationPatcher_1.default;
            case 'ExportNamedDeclaration':
                return ExportNamedDeclarationPatcher_1.default;
            default:
                return null;
        }
    };
    return MainStage;
}(TransformCoffeeScriptStage_1.default));
exports.default = MainStage;
