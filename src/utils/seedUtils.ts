export interface SeedResult {
  collection: string
  count: number
  success: boolean
  error?: string
}

export class SeedManager {
  private results: SeedResult[] = []

  async logSeedResult(collection: string, count: number, success: boolean, error?: string) {
    this.results.push({ collection, count, success, error })
    
    if (success) {
      console.log(`✅ ${collection}: ${count} items seeded successfully`)
    } else {
      console.error(`❌ ${collection}: Failed - ${error}`)
    }
  }

  getSummary() {
    const successful = this.results.filter(r => r.success)
    const failed = this.results.filter(r => !r.success)
    
    return {
      total: this.results.length,
      successful: successful.length,
      failed: failed.length,
      totalItems: successful.reduce((sum, r) => sum + r.count, 0),
      results: this.results
    }
  }

  printSummary() {
    const summary = this.getSummary()
    
    console.log('\n📊 SEEDING SUMMARY')
    console.log('='.repeat(50))
    console.log(`Total Collections: ${summary.total}`)
    console.log(`Successful: ${summary.successful}`)
    console.log(`Failed: ${summary.failed}`)
    console.log(`Total Items Created: ${summary.totalItems}`)
    
    if (summary.failed > 0) {
      console.log('\n❌ Failed Collections:')
      summary.results.filter(r => !r.success).forEach(r => {
        console.log(`   - ${r.collection}: ${r.error}`)
      })
    }
    
    console.log('='.repeat(50))
  }
}

export function createSectionPlanMapping(sections: any[], plans: any[]) {
  const mapping = new Map()
  
  sections.forEach(section => {
    const key = `${section.no}-${section.role[0]}`
    if (!mapping.has(key)) {
      mapping.set(key, [])
    }
    mapping.get(key).push({
      sectionId: section._id,
      planId: section.subplan,
      planTitle: plans.find(p => p._id.toString() === section.subplan.toString())?.title || 'Unknown'
    })
  })
  
  return mapping
}

export function validateSeedData(data: any[], requiredFields: string[]) {
  const errors: string[] = []
  
  data.forEach((item, index) => {
    requiredFields.forEach(field => {
      if (!item[field]) {
        errors.push(`Item ${index}: Missing required field '${field}'`)
      }
    })
  })
  
  return errors
}

export async function createBulkOps(data: any[], Model: any, filterFields: string[]) {
  return data.map(item => ({
    updateOne: {
      filter: filterFields.reduce((filter, field) => {
        filter[field] = item[field]
        return filter
      }, {} as any),
      update: { $set: item },
      upsert: true,
    },
  }))
}
