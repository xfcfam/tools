import { ClassificationBusiness } from './logic/ClassificationBusiness.js'
import { RuleEngineBusiness } from './logic/RuleEngineBusiness.js'
import { ConformanceBusiness } from './logic/ConformanceBusiness.js'
import { ArtefactBusiness } from './logic/ArtefactBusiness.js'
import { LanguageBusiness } from './logic/LanguageBusiness.js'

import { TypeScriptParserBusiness } from './logic/parsers/TypeScriptParserBusiness.js'
import { JavaScriptParserBusiness } from './logic/parsers/JavaScriptParserBusiness.js'
import { PythonParserBusiness } from './logic/parsers/PythonParserBusiness.js'
import { JavaParserBusiness } from './logic/parsers/JavaParserBusiness.js'
import { KotlinParserBusiness } from './logic/parsers/KotlinParserBusiness.js'
import { SwiftParserBusiness } from './logic/parsers/SwiftParserBusiness.js'
import { CSharpParserBusiness } from './logic/parsers/CSharpParserBusiness.js'
import { CppParserBusiness } from './logic/parsers/CppParserBusiness.js'

import type { RuleBusiness } from './general/RuleBusiness.js'
import type { LanguageParserBusiness } from './general/LanguageParserBusiness.js'
import type { LanguageId } from './transfers/Language.js'

// ═══════════════════════════════════════════════════════════════
//  Catalog of rules — xfa-en.tex § 11.3 (edition XF-CFAM-001:2026).
//  71 rules across 9 thematic groups (61 structural + 10 semantic).
// ═══════════════════════════════════════════════════════════════

// ── Group 1 — Folder structure ──
import { StructureLayerMismatchBusiness } from './logic/rules/structural/StructureLayerMismatchBusiness.js'
import { StructureTypeMismatchBusiness } from './logic/rules/structural/StructureTypeMismatchBusiness.js'
import { StructureInjectionMissingBusiness } from './logic/rules/structural/StructureInjectionMissingBusiness.js'
import { StructureInjectionMultiplicityBusiness } from './logic/rules/structural/StructureInjectionMultiplicityBusiness.js'
import { StructureComponentNamingBusiness } from './logic/rules/structural/StructureComponentNamingBusiness.js'
import { StructureDomainSubdivisionBusiness } from './logic/rules/structural/StructureDomainSubdivisionBusiness.js'

// ── Group 2 — Layer isolation ──
import { LayerReferenceBusiness } from './logic/rules/artefact/LayerReferenceBusiness.js'
import { LayerInheritanceBusiness } from './logic/rules/artefact/LayerInheritanceBusiness.js'
import { LayerSkipBusiness } from './logic/rules/artefact/LayerSkipBusiness.js'

// ── Group 3 — Logical components ──
import { LogicNamingRepositoryBusiness } from './logic/rules/structural/LogicNamingRepositoryBusiness.js'
import { LogicNamingBusinessBusiness } from './logic/rules/structural/LogicNamingBusinessBusiness.js'
import { LogicNamingServiceBusiness } from './logic/rules/structural/LogicNamingServiceBusiness.js'
import { LogicNamingViewBusiness } from './logic/rules/structural/LogicNamingViewBusiness.js'
import { LogicMismatchRepositoryBusiness } from './logic/rules/component/LogicMismatchRepositoryBusiness.js'
import { LogicMismatchBusinessBusiness } from './logic/rules/component/LogicMismatchBusinessBusiness.js'
import { LogicMismatchApiBusiness } from './logic/rules/component/LogicMismatchApiBusiness.js'
import { LogicInitializationMissingBusiness } from './logic/rules/component/LogicInitializationMissingBusiness.js'
import { LogicTerminationMissingBusiness } from './logic/rules/component/LogicTerminationMissingBusiness.js'
import { LogicConstructorMismatchBusiness } from './logic/rules/component/LogicConstructorMismatchBusiness.js'
import { LogicInheritanceBusiness } from './logic/rules/component/LogicInheritanceBusiness.js'

// ── Group 4 — Generalization components ──
import { GeneralNamingRepositoryBusiness } from './logic/rules/structural/GeneralNamingRepositoryBusiness.js'
import { GeneralNamingBusinessBusiness } from './logic/rules/structural/GeneralNamingBusinessBusiness.js'
import { GeneralNamingServiceBusiness } from './logic/rules/structural/GeneralNamingServiceBusiness.js'
import { GeneralNamingViewBusiness } from './logic/rules/structural/GeneralNamingViewBusiness.js'
import { GeneralMismatchRepositoryBusiness } from './logic/rules/component/GeneralMismatchRepositoryBusiness.js'
import { GeneralMismatchBusinessBusiness } from './logic/rules/component/GeneralMismatchBusinessBusiness.js'
import { GeneralMismatchApiBusiness } from './logic/rules/component/GeneralMismatchApiBusiness.js'
import { GeneralInjectionReferenceBusiness } from './logic/rules/artefact/GeneralInjectionReferenceBusiness.js'
import { GeneralDomainStateBusiness } from './logic/rules/component/GeneralDomainStateBusiness.js'
import { GeneralInstantiableBusiness } from './logic/rules/component/GeneralInstantiableBusiness.js'
import { GeneralInitializationMissingBusiness } from './logic/rules/component/GeneralInitializationMissingBusiness.js'
import { GeneralTerminationMissingBusiness } from './logic/rules/component/GeneralTerminationMissingBusiness.js'
import { GeneralConstructorMismatchBusiness } from './logic/rules/component/GeneralConstructorMismatchBusiness.js'
import { GeneralInheritanceBusiness } from './logic/rules/component/GeneralInheritanceBusiness.js'

// ── Group 5 — Injection components ──
import { InjectionNamingRBusiness } from './logic/rules/structural/InjectionNamingRBusiness.js'
import { InjectionNamingBBusiness } from './logic/rules/structural/InjectionNamingBBusiness.js'
import { InjectionNamingABusiness } from './logic/rules/structural/InjectionNamingABusiness.js'
import { InjectionNonRepositoryBusiness } from './logic/rules/component/InjectionNonRepositoryBusiness.js'
import { InjectionNonBusinessBusiness } from './logic/rules/component/InjectionNonBusinessBusiness.js'
import { InjectionNonApiBusiness } from './logic/rules/component/InjectionNonApiBusiness.js'
import { InjectionMismatchBusiness } from './logic/rules/component/InjectionMismatchBusiness.js'
import { InjectionInstantiableBusiness } from './logic/rules/component/InjectionInstantiableBusiness.js'
import { InjectionMemberMutableBusiness } from './logic/rules/component/InjectionMemberMutableBusiness.js'
import { InjectionMemberPublicBusiness } from './logic/rules/component/InjectionMemberPublicBusiness.js'
import { InjectionInitMissingBusiness } from './logic/rules/component/InjectionInitMissingBusiness.js'
import { InjectionTerminateMissingBusiness } from './logic/rules/component/InjectionTerminateMissingBusiness.js'
import { InjectionInitMismatchBusiness } from './logic/rules/component/InjectionInitMismatchBusiness.js'
import { InjectionTerminateMismatchBusiness } from './logic/rules/component/InjectionTerminateMismatchBusiness.js'
import { InjectionLifecycleSymmetryBusiness } from './logic/rules/component/InjectionLifecycleSymmetryBusiness.js'
import { InjectionInheritanceBusiness } from './logic/rules/component/InjectionInheritanceBusiness.js'

// ── Group 6 — Utility components ──
import { UtilityNamingBusiness } from './logic/rules/structural/UtilityNamingBusiness.js'
import { UtilityMismatchBusiness } from './logic/rules/component/UtilityMismatchBusiness.js'
import { UtilityInstantiableBusiness } from './logic/rules/component/UtilityInstantiableBusiness.js'
import { UtilityMemberInstanceBusiness } from './logic/rules/component/UtilityMemberInstanceBusiness.js'
import { UtilityMutableStateBusiness } from './logic/rules/component/UtilityMutableStateBusiness.js'
import { UtilityInheritanceBusiness } from './logic/rules/component/UtilityInheritanceBusiness.js'

// ── Group 7 — Transfer components ──
import { TransferNamingBusiness } from './logic/rules/component/TransferNamingBusiness.js'
import { TransferDependencyBusiness } from './logic/rules/artefact/TransferDependencyBusiness.js'
import { TransferBusinessLogicBusiness } from './logic/rules/component/TransferBusinessLogicBusiness.js'
import { TransferInheritanceBusiness } from './logic/rules/component/TransferInheritanceBusiness.js'

// ── Group 8 — XF start-point element ──
import { XfInitMissingBusiness } from './logic/rules/component/XfInitMissingBusiness.js'
import { XfTerminateMissingBusiness } from './logic/rules/component/XfTerminateMissingBusiness.js'
import { XfInitMismatchBusiness } from './logic/rules/component/XfInitMismatchBusiness.js'
import { XfTerminateMismatchBusiness } from './logic/rules/component/XfTerminateMismatchBusiness.js'

// ── Group 9 — Exclusivity of lifecycle orchestration ──
import { LifecycleLogicInstantiationBusiness } from './logic/rules/artefact/LifecycleLogicInstantiationBusiness.js'
import { LifecycleLogicInitBusiness } from './logic/rules/artefact/LifecycleLogicInitBusiness.js'
import { LifecycleLogicTerminateBusiness } from './logic/rules/artefact/LifecycleLogicTerminateBusiness.js'
import { LifecycleInjectionInitBusiness } from './logic/rules/artefact/LifecycleInjectionInitBusiness.js'
import { LifecycleInjectionTerminateBusiness } from './logic/rules/artefact/LifecycleInjectionTerminateBusiness.js'
import { LifecycleXfInitBusiness } from './logic/rules/artefact/LifecycleXfInitBusiness.js'
import { LifecycleXfTerminateBusiness } from './logic/rules/artefact/LifecycleXfTerminateBusiness.js'

/**
 * Business Layer Injection — canonical XF singleton.
 *
 * Registers the 71 rules of the normative catalog (§ 11.3), grouped
 * 1–9, plus the four orchestration Logicals: classification, rule
 * engine, conformance, artefact. The 10 semantic rules are registered
 * but never fail the static analysis (they require human review).
 */
export class B {
  private constructor() {}

  /** Catalog of every rule (§ 11.3). Order determines reporting order. */
  static readonly rules: readonly RuleBusiness[] = [
    // ── Group 1 — Folder structure ──
    new StructureLayerMismatchBusiness(),
    new StructureTypeMismatchBusiness(),
    new StructureInjectionMissingBusiness(),
    new StructureInjectionMultiplicityBusiness(),
    new StructureComponentNamingBusiness(),
    new StructureDomainSubdivisionBusiness(),
    // ── Group 2 — Layer isolation ──
    new LayerReferenceBusiness(),
    new LayerInheritanceBusiness(),
    new LayerSkipBusiness(),
    // ── Group 3 — Logical components ──
    new LogicNamingRepositoryBusiness(),
    new LogicNamingBusinessBusiness(),
    new LogicNamingServiceBusiness(),
    new LogicNamingViewBusiness(),
    new LogicMismatchRepositoryBusiness(),
    new LogicMismatchBusinessBusiness(),
    new LogicMismatchApiBusiness(),
    new LogicInitializationMissingBusiness(),
    new LogicTerminationMissingBusiness(),
    new LogicConstructorMismatchBusiness(),
    new LogicInheritanceBusiness(),
    // ── Group 4 — Generalization components ──
    new GeneralNamingRepositoryBusiness(),
    new GeneralNamingBusinessBusiness(),
    new GeneralNamingServiceBusiness(),
    new GeneralNamingViewBusiness(),
    new GeneralMismatchRepositoryBusiness(),
    new GeneralMismatchBusinessBusiness(),
    new GeneralMismatchApiBusiness(),
    new GeneralInjectionReferenceBusiness(),
    new GeneralDomainStateBusiness(),
    new GeneralInstantiableBusiness(),
    new GeneralInitializationMissingBusiness(),
    new GeneralTerminationMissingBusiness(),
    new GeneralConstructorMismatchBusiness(),
    new GeneralInheritanceBusiness(),
    // ── Group 5 — Injection components ──
    new InjectionNamingRBusiness(),
    new InjectionNamingBBusiness(),
    new InjectionNamingABusiness(),
    new InjectionNonRepositoryBusiness(),
    new InjectionNonBusinessBusiness(),
    new InjectionNonApiBusiness(),
    new InjectionMismatchBusiness(),
    new InjectionInstantiableBusiness(),
    new InjectionMemberMutableBusiness(),
    new InjectionMemberPublicBusiness(),
    new InjectionInitMissingBusiness(),
    new InjectionTerminateMissingBusiness(),
    new InjectionInitMismatchBusiness(),
    new InjectionTerminateMismatchBusiness(),
    new InjectionLifecycleSymmetryBusiness(),
    new InjectionInheritanceBusiness(),
    // ── Group 6 — Utility components ──
    new UtilityNamingBusiness(),
    new UtilityMismatchBusiness(),
    new UtilityInstantiableBusiness(),
    new UtilityMemberInstanceBusiness(),
    new UtilityMutableStateBusiness(),
    new UtilityInheritanceBusiness(),
    // ── Group 7 — Transfer components ──
    new TransferNamingBusiness(),
    new TransferDependencyBusiness(),
    new TransferBusinessLogicBusiness(),
    new TransferInheritanceBusiness(),
    // ── Group 8 — XF start-point element ──
    new XfInitMissingBusiness(),
    new XfTerminateMissingBusiness(),
    new XfInitMismatchBusiness(),
    new XfTerminateMismatchBusiness(),
    // ── Group 9 — Exclusivity of lifecycle orchestration ──
    new LifecycleLogicInstantiationBusiness(),
    new LifecycleLogicInitBusiness(),
    new LifecycleLogicTerminateBusiness(),
    new LifecycleInjectionInitBusiness(),
    new LifecycleInjectionTerminateBusiness(),
    new LifecycleXfInitBusiness(),
    new LifecycleXfTerminateBusiness(),
  ]

  static readonly language       = new LanguageBusiness()
  static readonly classification = new ClassificationBusiness()
  static readonly ruleEngine     = new RuleEngineBusiness(B.rules)
  static readonly conformance    = new ConformanceBusiness()
  static readonly artefact       = new ArtefactBusiness()

  // ── Per-language parsers (Business Logicals extending LanguageParserBusiness) ──
  static readonly typeScriptParser = new TypeScriptParserBusiness()
  static readonly javaScriptParser = new JavaScriptParserBusiness()
  static readonly pythonParser     = new PythonParserBusiness()
  static readonly javaParser       = new JavaParserBusiness()
  static readonly kotlinParser     = new KotlinParserBusiness()
  static readonly swiftParser      = new SwiftParserBusiness()
  static readonly cSharpParser     = new CSharpParserBusiness()
  static readonly cppParser        = new CppParserBusiness()

  /** Lookup table of every per-language parser, keyed by `LanguageId`. */
  static readonly parsers: ReadonlyMap<LanguageId, LanguageParserBusiness> = new Map<LanguageId, LanguageParserBusiness>([
    ['typescript', B.typeScriptParser],
    ['javascript', B.javaScriptParser],
    ['python',     B.pythonParser],
    ['java',       B.javaParser],
    ['kotlin',     B.kotlinParser],
    ['swift',      B.swiftParser],
    ['csharp',     B.cSharpParser],
    ['cpp',        B.cppParser],
  ])

  static async init(): Promise<void> {
    for (const r of B.rules) await r.init()
    await B.language.init()
    await B.classification.init()
    await B.ruleEngine.init()
    await B.conformance.init()
    await B.typeScriptParser.init()
    await B.javaScriptParser.init()
    await B.pythonParser.init()
    await B.javaParser.init()
    await B.kotlinParser.init()
    await B.swiftParser.init()
    await B.cSharpParser.init()
    await B.cppParser.init()
    await B.artefact.init()
  }

  static async terminate(): Promise<void> {
    await B.artefact.terminate()
    await B.cppParser.terminate()
    await B.cSharpParser.terminate()
    await B.swiftParser.terminate()
    await B.kotlinParser.terminate()
    await B.javaParser.terminate()
    await B.pythonParser.terminate()
    await B.javaScriptParser.terminate()
    await B.typeScriptParser.terminate()
    await B.conformance.terminate()
    await B.ruleEngine.terminate()
    await B.classification.terminate()
    await B.language.terminate()
    for (const r of [...B.rules].reverse()) await r.terminate()
  }
}
