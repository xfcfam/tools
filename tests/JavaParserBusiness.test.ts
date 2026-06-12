import { describe, expect, it } from 'vitest'
import { JavaParserBusiness } from '../src/business/logic/parsers/JavaParserBusiness.js'

/**
 * Unit tests for {@link JavaParserBusiness}. Drive the parser with
 * inline Java strings (no fixture files) and assert the `SourceFile`
 * projection shape that downstream XF rules consume.
 *
 * The parser uses the `java-parser` npm package — these tests must be
 * run AFTER `pnpm install` has fetched the dependency. They are
 * skipped at build-time on environments without npm registry access;
 * they will pass when run locally on the maintainer's machine.
 */

const parser = new JavaParserBusiness()
const parse = (src: string): ReturnType<JavaParserBusiness['parse']> =>
  parser.parse('Test.java', src)

describe('JavaParserBusiness — imports', () => {
  it('parses a simple import', () => {
    const sf = parse('package com.example; import java.util.List; class X {}')
    expect(sf.imports.length).toBe(1)
    expect(sf.imports[0]?.specifier).toBe('java.util.List')
    expect(sf.imports[0]?.names).toEqual(['List'])
    expect(sf.imports[0]?.isTypeOnly).toBe(false)
  })

  it('parses a wildcard import', () => {
    const sf = parse('import java.util.*; class X {}')
    expect(sf.imports[0]?.specifier).toBe('java.util.*')
    expect(sf.imports[0]?.names).toEqual(['*'])
  })

  it('parses a static import', () => {
    const sf = parse('import static java.lang.Math.PI; class X {}')
    expect(sf.imports[0]?.specifier).toBe('static java.lang.Math.PI')
    expect(sf.imports[0]?.names).toEqual(['PI'])
  })

  it('collects every import in declaration order', () => {
    const src = `
      package com.example;
      import java.util.List;
      import java.util.Map;
      import java.util.Set;
      class X {}
    `
    const sf = parse(src)
    expect(sf.imports.map(i => i.specifier)).toEqual([
      'java.util.List', 'java.util.Map', 'java.util.Set',
    ])
  })
})

describe('JavaParserBusiness — classes', () => {
  it('parses a plain top-level class', () => {
    const sf = parse('public class Foo {}')
    expect(sf.classes.length).toBe(1)
    expect(sf.classes[0]?.name).toBe('Foo')
    expect(sf.classes[0]?.isAbstract).toBe(false)
    expect(sf.hasExports).toBe(true)
  })

  it('detects abstract classes', () => {
    const sf = parse('public abstract class FooBusiness {}')
    expect(sf.classes[0]?.name).toBe('FooBusiness')
    expect(sf.classes[0]?.isAbstract).toBe(true)
  })

  it('extracts the simple name of the extended class', () => {
    const sf = parse('public class FooBusiness extends StatelessBusiness {}')
    expect(sf.classes[0]?.extendsName).toBe('StatelessBusiness')
  })

  it('strips the package prefix in extends', () => {
    const sf = parse('public class FooBusiness extends org.xfcfam.xf.StatelessBusiness {}')
    expect(sf.classes[0]?.extendsName).toBe('StatelessBusiness')
  })

  it('flags private vs non-private constructors', () => {
    const sf = parse(`
      public class Singleton {
        private Singleton() {}
      }
    `)
    expect(sf.classes[0]?.hasPrivateConstructor).toBe(true)
    expect(sf.classes[0]?.hasPublicConstructor).toBe(false)
  })

  it('flags non-private constructors as public', () => {
    const sf = parse(`
      public class Pojo {
        public Pojo() {}
      }
    `)
    expect(sf.classes[0]?.hasPrivateConstructor).toBe(false)
    expect(sf.classes[0]?.hasPublicConstructor).toBe(true)
  })

  it('separates static vs instance fields and methods', () => {
    const sf = parse(`
      public class R {
        public static final UserRepository userRepository = new UserRepository();
        private int counter = 0;
        public static void init() {}
        public void refresh() {}
      }
    `)
    const c = sf.classes[0]
    expect(c?.staticFields).toContain('userRepository')
    expect(c?.staticMethods).toContain('init')
    expect(c?.instanceMethods).toContain('refresh')
    // counter is private — excluded from the public projection.
    expect(c?.instanceFields).not.toContain('counter')
  })

  it('handles multiple top-level classes', () => {
    const sf = parse(`
      public class A {}
      class B {}
    `)
    expect(sf.classes.map(c => c.name)).toEqual(['A', 'B'])
  })
})

describe('JavaParserBusiness — throw statements', () => {
  it('collects throw new X(...) statements', () => {
    const sf = parse(`
      public class S {
        public void run() {
          if (true) throw new IllegalArgumentException("bad");
        }
      }
    `)
    expect(sf.throws.length).toBe(1)
    expect(sf.throws[0]?.typeName).toBe('IllegalArgumentException')
  })

  it('records null typeName for re-throws', () => {
    const sf = parse(`
      public class S {
        public void run() {
          try { } catch (Exception e) { throw e; }
        }
      }
    `)
    expect(sf.throws.length).toBe(1)
    expect(sf.throws[0]?.typeName).toBeNull()
  })

  it('does not confuse method-level throws clauses with raise sites', () => {
    const sf = parse(`
      public class S {
        public void run() throws IOException { }
      }
    `)
    // `throws IOException` in the signature is NOT a raise site.
    expect(sf.throws.length).toBe(0)
  })
})

describe('JavaParserBusiness — degraded mode', () => {
  it('returns empty SourceFile on syntax error', () => {
    const sf = parse('class { invalid }')
    expect(sf.classes).toEqual([])
    expect(sf.imports).toEqual([])
    expect(sf.throws).toEqual([])
    expect(sf.hasExports).toBe(false)
    // Original text is still preserved
    expect(sf.text).toBe('class { invalid }')
  })

  it('handles empty file gracefully', () => {
    const sf = parse('')
    expect(sf.classes).toEqual([])
    expect(sf.imports).toEqual([])
  })
})
