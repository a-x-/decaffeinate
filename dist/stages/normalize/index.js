"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var PassthroughPatcher_1 = require("../../patchers/PassthroughPatcher");
var TransformCoffeeScriptStage_1 = require("../TransformCoffeeScriptStage");
var ArrayInitialiserPatcher_1 = require("./patchers/ArrayInitialiserPatcher");
var AssignOpPatcher_1 = require("./patchers/AssignOpPatcher");
var BlockPatcher_1 = require("./patchers/BlockPatcher");
var ClassPatcher_1 = require("./patchers/ClassPatcher");
var ConditionalPatcher_1 = require("./patchers/ConditionalPatcher");
var ConstructorPatcher_1 = require("./patchers/ConstructorPatcher");
var DefaultParamPatcher_1 = require("./patchers/DefaultParamPatcher");
var DoOpPatcher_1 = require("./patchers/DoOpPatcher");
var DynamicMemberAccessOpPatcher_1 = require("./patchers/DynamicMemberAccessOpPatcher");
var ExpansionPatcher_1 = require("./patchers/ExpansionPatcher");
var ForFromPatcher_1 = require("./patchers/ForFromPatcher");
var ForInPatcher_1 = require("./patchers/ForInPatcher");
var ForOfPatcher_1 = require("./patchers/ForOfPatcher");
var FunctionApplicationPatcher_1 = require("./patchers/FunctionApplicationPatcher");
var FunctionPatcher_1 = require("./patchers/FunctionPatcher");
var IdentifierPatcher_1 = require("./patchers/IdentifierPatcher");
var LoopPatcher_1 = require("./patchers/LoopPatcher");
var MemberAccessOpPatcher_1 = require("./patchers/MemberAccessOpPatcher");
var ObjectInitialiserMemberPatcher_1 = require("./patchers/ObjectInitialiserMemberPatcher");
var ObjectInitialiserPatcher_1 = require("./patchers/ObjectInitialiserPatcher");
var ProgramPatcher_1 = require("./patchers/ProgramPatcher");
var ProtoMemberAccessOpPatcher_1 = require("./patchers/ProtoMemberAccessOpPatcher");
var SpreadPatcher_1 = require("./patchers/SpreadPatcher");
var SuperPatcher_1 = require("./patchers/SuperPatcher");
var ThisPatcher_1 = require("./patchers/ThisPatcher");
var TryPatcher_1 = require("./patchers/TryPatcher");
var WhilePatcher_1 = require("./patchers/WhilePatcher");
var NormalizeStage = /** @class */ (function (_super) {
    tslib_1.__extends(NormalizeStage, _super);
    function NormalizeStage() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    NormalizeStage.prototype.patcherConstructorForNode = function (node) {
        switch (node.type) {
            case 'ArrayInitialiser':
                return ArrayInitialiserPatcher_1.default;
            case 'MemberAccessOp':
                return MemberAccessOpPatcher_1.default;
            case 'DynamicMemberAccessOp':
                return DynamicMemberAccessOpPatcher_1.default;
            case 'Block':
                return BlockPatcher_1.default;
            case 'BoundFunction':
            case 'Function':
            case 'BoundGeneratorFunction':
            case 'GeneratorFunction':
                return FunctionPatcher_1.default;
            case 'Conditional':
                return ConditionalPatcher_1.default;
            case 'Constructor':
                return ConstructorPatcher_1.default;
            case 'DoOp':
                return DoOpPatcher_1.default;
            case 'Expansion':
                return ExpansionPatcher_1.default;
            case 'ForIn':
                return ForInPatcher_1.default;
            case 'ForOf':
                return ForOfPatcher_1.default;
            case 'ForFrom':
                return ForFromPatcher_1.default;
            case 'FunctionApplication':
            case 'NewOp':
            case 'SoakedFunctionApplication':
            case 'SoakedNewOp':
                return FunctionApplicationPatcher_1.default;
            case 'Super':
            case 'BareSuperFunctionApplication':
                return SuperPatcher_1.default;
            case 'Identifier':
                return IdentifierPatcher_1.default;
            case 'While':
                return WhilePatcher_1.default;
            case 'Loop':
                return LoopPatcher_1.default;
            case 'Class':
                return ClassPatcher_1.default;
            case 'AssignOp':
            case 'ClassProtoAssignOp':
            case 'CompoundAssignOp':
                return AssignOpPatcher_1.default;
            case 'Program':
                return ProgramPatcher_1.default;
            case 'DefaultParam':
                return DefaultParamPatcher_1.default;
            case 'Rest':
            case 'Spread':
                return SpreadPatcher_1.default;
            case 'ObjectInitialiser':
                return ObjectInitialiserPatcher_1.default;
            case 'ObjectInitialiserMember':
                return ObjectInitialiserMemberPatcher_1.default;
            case 'ProtoMemberAccessOp':
            case 'SoakedProtoMemberAccessOp':
                return ProtoMemberAccessOpPatcher_1.default;
            case 'Try':
                return TryPatcher_1.default;
            case 'This':
                return ThisPatcher_1.default;
            default:
                return PassthroughPatcher_1.default;
        }
    };
    return NormalizeStage;
}(TransformCoffeeScriptStage_1.default));
exports.default = NormalizeStage;
