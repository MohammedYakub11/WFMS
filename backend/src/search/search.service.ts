import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Brackets } from 'typeorm';
import { EmployeeSkill } from '../employee-skills/entities/employee-skill.entity';
import { Employee } from '../employees/entities/employee.entity';
import { SearchQueryDto } from './dto/search-query.dto';

@Injectable()
export class SearchService {
  constructor(
    @InjectRepository(Employee)
    private readonly employeeRepository: Repository<Employee>,
    @InjectRepository(EmployeeSkill)
    private readonly employeeSkillRepository: Repository<EmployeeSkill>,
  ) {}

  async searchWorkforce(query: SearchQueryDto) {
    const {
      page = 1,
      limit = 10,
      keyword,
      department,
      designation,
      location,
      category,
      skill,
      proficiency,
      certified,
      experienceMin,
      experienceMax,
    } = query;

    const pageNum = typeof page === 'string' ? parseInt(page, 10) : (page as number);
    const limitNum = typeof limit === 'string' ? parseInt(limit, 10) : (limit as number);

    const queryBuilder = this.employeeRepository.createQueryBuilder('employee')
      .leftJoinAndSelect('employee.employeeSkills', 'employeeSkill', 'employeeSkill.approvalStatus = :status', { status: 'approved' })
      .leftJoinAndSelect('employeeSkill.skill', 'skill')
      .leftJoinAndSelect('skill.category', 'category')
      .where('employee.status = :empStatus', { empStatus: 'active' });

    if (keyword) {
      const searchTerm = '%' + keyword + '%';
      queryBuilder.andWhere(new Brackets(qb => {
        qb.where('employee.first_name ILIKE :term', { term: searchTerm })
          .orWhere('employee.last_name ILIKE :term', { term: searchTerm })
          .orWhere('employee.email ILIKE :term', { term: searchTerm })
          .orWhere('skill.skillName ILIKE :term', { term: searchTerm });
      }));
    }

    if (department) {
      queryBuilder.andWhere('employee.department = :department', { department });
    }
    if (designation) {
      queryBuilder.andWhere('employee.designation = :designation', { designation });
    }
    if (location) {
      queryBuilder.andWhere('employee.location = :location', { location });
    }

    if (category || skill || proficiency || certified || experienceMin || experienceMax) {
      queryBuilder.andWhere(new Brackets(qb => {
        const subQuery = this.employeeSkillRepository.createQueryBuilder('es')
          .select('es.employeeId')
          .leftJoin('es.skill', 's')
          .leftJoin('s.category', 'c')
          .where('es.approvalStatus = :subStatus', { subStatus: 'approved' });

        if (category) {
          subQuery.andWhere('c.id = :category', { category });
        }
        if (skill) {
          subQuery.andWhere('s.id = :skill', { skill });
        }
        if (proficiency) {
          const profNum = typeof proficiency === 'string' ? parseInt(proficiency, 10) : (proficiency as number);
          subQuery.andWhere('es.proficiencyRating >= :proficiency', { proficiency: profNum });
        }
        if (certified === 'true' || certified === true) {
          subQuery.andWhere('es.isCertified = :certified', { certified: true });
        }
        if (experienceMin) {
          const expMinNum = typeof experienceMin === 'string' ? parseInt(experienceMin, 10) : (experienceMin as number);
          subQuery.andWhere('es.yearsOfExperience >= :expMin', { expMin: expMinNum });
        }
        if (experienceMax) {
          const expMaxNum = typeof experienceMax === 'string' ? parseInt(experienceMax, 10) : (experienceMax as number);
          subQuery.andWhere('es.yearsOfExperience <= :expMax', { expMax: expMaxNum });
        }

        qb.where('employee.id IN (' + subQuery.getQuery() + ')', subQuery.getParameters());
      }));
    }

    const total = await queryBuilder.getCount();
    
    queryBuilder
      .orderBy('employee.first_name', 'ASC')
      .addOrderBy('employee.last_name', 'ASC')
      .skip((pageNum - 1) * limitNum)
      .take(limitNum);

    const employees = await queryBuilder.getMany();

    const items = employees.map(emp => {
      const approvedSkills = emp.employeeSkills || [];
      const primarySkills = approvedSkills.slice(0, 3).map(es => es.skill.skillName);
      
      const avgProficiency = approvedSkills.length > 0 
        ? approvedSkills.reduce((acc, es) => acc + (es.proficiencyRating || 0), 0) / approvedSkills.length 
        : 0;

      const certifications = approvedSkills.filter(es => es.isCertified).length;

      return {
        id: emp.id,
        employee_code: emp.employee_code,
        first_name: emp.first_name,
        last_name: emp.last_name,
        email: emp.email,
        designation: emp.designation,
        department: emp.department,
        location: emp.location,
        profile_image: emp.profile_image,
        primarySkills,
        averageProficiency: avgProficiency.toFixed(1),
        certificationsCount: certifications,
        totalSkills: approvedSkills.length,
      };
    });

    return {
      items,
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum),
    };
  }

  async getSearchMetadata() {
    const getDistinct = async (column: string) => {
      const result = await this.employeeRepository.createQueryBuilder('e')
        .select('DISTINCT e.' + column, 'value')
        .where('e.' + column + ' IS NOT NULL')
        .getRawMany<{ value: string }>();
      return result.map(r => r.value).sort();
    };

    const [departments, designations, locations] = await Promise.all([
      getDistinct('department'),
      getDistinct('designation'),
      getDistinct('location'),
    ]);

    return {
      departments,
      designations,
      locations,
    };
  }
}
