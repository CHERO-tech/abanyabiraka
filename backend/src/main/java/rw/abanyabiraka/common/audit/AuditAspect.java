package rw.abanyabiraka.common.audit;

import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.springframework.stereotype.Component;

@Aspect
@Component
public class AuditAspect {

    @Around("execution(* rw.abanyabiraka..*Service.*(..))")
    public Object auditMethod(ProceedingJoinPoint joinPoint) throws Throwable {
        // Placeholder for audit logic; can be expanded later.
        return joinPoint.proceed();
    }
}
