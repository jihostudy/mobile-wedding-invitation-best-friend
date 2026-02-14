# ADR-0005: 테스트 전략 및 규칙

## 메타 정보

| 항목 | 내용                                                                 |
| ---- | -------------------------------------------------------------------- |
| 상태 | Accepted                                                             |
| 목적 | 수강신청 시스템의 요구사항을 테스트 코드로 검증하기 위한 전략·규칙·구조 표준화 |
| 범위 | 단위 테스트, 통합 테스트, 동시성 테스트, API 테스트 전반               |
| 선행 | ADR-0004 (Technology Selection), `docs/REQUIREMENTS.md`, `docs/001-api-specification.md` |

---

## 1. 테스트 철학

### 1.1 핵심 원칙

> **"테스트는 요구사항의 실행 가능한 명세(Executable Specification)이다."**

- 테스트 코드는 **비즈니스 요구사항을 1:1로 증명**하는 문서 역할을 한다.
- 평가자가 테스트를 읽는 것만으로 시스템이 어떤 규칙을 지키는지 파악할 수 있어야 한다.
- 테스트가 깨지면 **프로덕션 코드가 아닌 요구사항 위반**을 의미하도록 작성한다.

### 1.2 신뢰할 수 있는 테스트의 조건

| 속성 | 설명 |
|------|------|
| **결정적(Deterministic)** | 같은 코드에 대해 항상 같은 결과를 반환한다. 랜덤·시간·외부 의존에 흔들리지 않는다 |
| **독립적(Independent)** | 테스트 간 실행 순서에 의존하지 않는다. 어떤 순서로 실행해도 결과가 동일하다 |
| **반복 가능(Repeatable)** | CI, 로컬, 다른 개발자 환경 어디서든 동일하게 통과한다 |
| **자기 검증(Self-Validating)** | 사람이 로그를 읽어서 판단하는 것이 아니라, 코드가 스스로 성공/실패를 판정한다 |
| **빠른(Fast)** | 단위 테스트는 밀리초, 통합 테스트는 수 초 이내에 완료한다 |

---

## 2. 테스트 분류 (Test Pyramid)

```
        ╱  E2E / API 인수 테스트  ╲         ← 적음 (핵심 시나리오만)
       ╱ ─────────────────────────── ╲
      ╱   통합 테스트 (Integration)    ╲     ← 중간 (서비스+DB 검증)
     ╱ ─────────────────────────────── ╲
    ╱    단위 테스트 (Unit)              ╲   ← 많음 (비즈니스 로직 집중)
   ╱ ─────────────────────────────────── ╲
```

### 2.1 계층별 정의

| 계층 | 범위 | Spring Context | DB | 대상 | 실행 시간 목표 |
|------|------|:--------------:|:--:|------|:-------------:|
| **단위 테스트** | 클래스/메서드 단위 | 없음 | 없음 (Mock) | Service 비즈니스 로직, Entity 도메인 로직 | < 100ms/test |
| **통합 테스트** | 서비스 → DB | `@DataJpaTest` 또는 `@SpringBootTest` | 실제 DB (Testcontainers) | Repository 쿼리, Service + DB 연동, 트랜잭션 | < 3s/test |
| **API 테스트** | HTTP 요청 → 응답 | `@SpringBootTest(webEnvironment = RANDOM_PORT)` | 실제 DB | 컨트롤러 요청/응답 형식, HTTP 상태 코드, 에러 메시지 | < 5s/test |
| **동시성 테스트** | 멀티스레드 시나리오 | `@SpringBootTest` | 실제 DB | 정원 초과 방지, 학점 초과 방지, 시간표 충돌 방지 | < 30s/test |

### 2.2 테스트 비율 가이드

| 계층 | 목표 비율 | 이 프로젝트에서의 역할 |
|------|:---------:|----------------------|
| 단위 테스트 | ~60% | 비즈니스 규칙(정원, 학점, 시간 충돌) 검증 |
| 통합 테스트 | ~25% | JPA 쿼리 정합성, 트랜잭션 경계 검증 |
| API 테스트 | ~10% | 엔드포인트별 요청/응답 계약 검증 |
| 동시성 테스트 | ~5% | Race Condition 방지 검증 (핵심) |

---

## 3. 네이밍 규칙

### 3.1 테스트 클래스 네이밍

```
{대상클래스명}{테스트계층}Test
```

| 계층 | 접미사 | 예시 |
|------|--------|------|
| 단위 테스트 | `Test` | `EnrollmentServiceTest` |
| 통합 테스트 | `IntegrationTest` | `EnrollmentServiceIntegrationTest` |
| API 테스트 | `ApiTest` | `EnrollmentApiTest` |
| 동시성 테스트 | `ConcurrencyTest` | `EnrollmentConcurrencyTest` |

### 3.2 테스트 메서드 네이밍

**한글 메서드명을 사용한다.** 테스트 메서드는 실행 가능한 명세이므로 한글이 가독성과 의도 전달에 압도적으로 유리하다.

```java
@Test
void 정원이_가득_찬_강좌에_수강신청하면_409_Conflict를_반환한다() { }

@Test
void 잔여_1석에_100명이_동시_신청하면_정확히_1명만_성공한다() { }

@Test
void 동일_시간대에_두_강좌를_수강신청하면_시간표_충돌로_실패한다() { }
```

**네이밍 패턴:**

```
{상태/조건}_{행위}_{기대결과}
```

| 부분 | 설명 | 예시 |
|------|------|------|
| 상태/조건 | 사전 조건(Given) | `정원이_가득_찬_강좌에` |
| 행위 | 테스트 대상 행위(When) | `수강신청하면` |
| 기대 결과 | 검증할 결과(Then) | `409_Conflict를_반환한다` |

### 3.3 @DisplayName 활용

메서드명이 길어질 경우 `@DisplayName`으로 보완한다. 리포트에서의 가독성을 위해 **자연어 문장**으로 작성한다.

```java
@Test
@DisplayName("정원 초과: 잔여 1석 강좌에 100명 동시 신청 → 정확히 1명만 성공")
void 잔여_1석에_100명이_동시_신청하면_정확히_1명만_성공한다() { }
```

---

## 4. 테스트 구조: Given-When-Then

모든 테스트는 **Given-When-Then** (또는 Arrange-Act-Assert) 3단계로 구조화한다. 주석으로 각 단계를 명시한다.

```java
@Test
void 학점_상한_초과시_수강신청이_거부된다() {
    // given — 사전 조건 설정
    Student student = createStudentWithCredits(16);
    Course course = createCourseWithCredits(3); // 16 + 3 = 19 > 18

    // when — 테스트 대상 행위 실행
    ThrowableAssert.ThrowingCallable action = () -> enrollmentService.enroll(student.getId(), course.getId());

    // then — 결과 검증
    assertThatThrownBy(action)
        .isInstanceOf(BusinessRuleViolationException.class)
        .hasMessageContaining("최대 학점(18)을 초과");
}
```

### 4.1 구조 규칙

| 규칙 | 설명 |
|------|------|
| **단일 행위(Single Act)** | `when` 절에는 하나의 행위만 존재해야 한다 |
| **단일 개념(Single Concept)** | 하나의 테스트는 하나의 비즈니스 규칙만 검증한다 |
| **명시적 Given** | 테스트에 필요한 모든 데이터는 테스트 메서드 안에서 명확히 설정한다. 외부 상태에 의존하지 않는다 |
| **구체적 Then** | `assertTrue(result)` 대신 `assertThat(result.getEnrolled()).isEqualTo(30)` 처럼 구체적으로 검증한다 |

---

## 5. Assertion 규칙

### 5.1 AssertJ 사용 (필수)

JUnit의 기본 Assertion 대신 **AssertJ**를 사용한다. 이유:
- 플루언트 API로 가독성이 높다
- 실패 메시지가 자동으로 상세하다
- 컬렉션, 예외, 추출 검증 등 풍부한 메서드를 제공한다

```java
// ❌ 지양 — JUnit 기본
assertEquals(30, course.getEnrolled());
assertTrue(result.isSuccess());

// ✅ 권장 — AssertJ
assertThat(course.getEnrolled()).isEqualTo(30);
assertThat(result.isSuccess()).isTrue();
assertThat(result.getData().getEnrollments())
    .hasSize(3)
    .extracting(Enrollment::getCourseName)
    .containsExactly("자료구조", "운영체제", "선형대수학");
```

### 5.2 예외 검증

```java
// ✅ 권장 — 예외 타입 + 메시지 동시 검증
assertThatThrownBy(() -> enrollmentService.enroll(studentId, courseId))
    .isInstanceOf(BusinessRuleViolationException.class)
    .hasMessageContaining("정원");
```

### 5.3 HTTP 응답 검증 (API 테스트)

```java
// ✅ 권장 — 상태 코드 + 응답 본문 구조 동시 검증
mockMvc.perform(post("/api/enrollments")
        .contentType(MediaType.APPLICATION_JSON)
        .content(requestBody))
    .andExpect(status().isConflict())
    .andExpect(jsonPath("$.success").value(false))
    .andExpect(jsonPath("$.message").value(containsString("정원")));
```

---

## 6. 테스트 데이터 관리

### 6.1 테스트 픽스처 전략

| 전략 | 사용 시점 | 예시 |
|------|----------|------|
| **팩토리 메서드** | 단위 테스트에서 객체 생성 | `TestFixtures.createStudent()` |
| **Builder 패턴** | 복잡한 객체, 일부 필드만 커스터마이징 필요 시 | `TestStudentBuilder.aStudent().withCredits(16).build()` |
| **@Sql / 초기화 메서드** | 통합 테스트에서 DB 시드 데이터 | `@Sql("/test-data/enrollment-scenario.sql")` |
| **EntityManager 직접 사용** | 통합 테스트에서 동적 데이터 설정 | `em.persist(student); em.flush();` |

### 6.2 테스트 데이터 격리

```java
// ✅ 권장 — @Transactional로 자동 롤백 (통합 테스트)
@SpringBootTest
@Transactional
class EnrollmentServiceIntegrationTest {
    // 각 테스트 종료 시 자동 롤백 → 테스트 간 데이터 격리
}

// ✅ 동시성 테스트 — @Transactional 사용 금지 (별도 스레드가 별도 트랜잭션 사용)
@SpringBootTest
class EnrollmentConcurrencyTest {
    @AfterEach
    void tearDown() {
        enrollmentRepository.deleteAll();
        // 명시적 정리
    }
}
```

### 6.3 테스트 픽스처 클래스 구조

```
src/test/java/com/musinsa/exam/
├── fixture/
│   ├── TestStudentFactory.java      — 학생 테스트 데이터 생성
│   ├── TestCourseFactory.java       — 강좌 테스트 데이터 생성
│   └── TestEnrollmentFactory.java   — 수강신청 테스트 데이터 생성
├── support/
│   ├── IntegrationTestSupport.java  — 통합 테스트 공통 상위 클래스
│   ├── ApiTestSupport.java          — API 테스트 공통 상위 클래스
│   └── ConcurrencyTestSupport.java  — 동시성 테스트 유틸리티
```

---

## 7. 테스트 계층별 상세 규칙

### 7.1 단위 테스트

| 규칙 | 설명 |
|------|------|
| Spring Context 로드 금지 | `@SpringBootTest`, `@DataJpaTest` 등 사용 금지. 순수 Java 테스트만 작성 |
| Mock 사용 | 외부 의존성(Repository 등)은 Mockito로 Mock 처리 |
| 대상 | Service의 비즈니스 로직, Entity의 도메인 로직 |
| 속도 | 테스트 하나 당 100ms 이내 |

```java
@ExtendWith(MockitoExtension.class)
class EnrollmentServiceTest {

    @InjectMocks
    private EnrollmentService enrollmentService;

    @Mock
    private CourseRepository courseRepository;

    @Mock
    private StudentRepository studentRepository;

    @Mock
    private EnrollmentRepository enrollmentRepository;

    @Test
    void 정원이_가득_찬_강좌에_수강신청하면_예외가_발생한다() {
        // given
        Course course = TestCourseFactory.fullCourse(); // enrolled == capacity
        given(courseRepository.findByIdForUpdate(1L)).willReturn(Optional.of(course));

        // when & then
        assertThatThrownBy(() -> enrollmentService.enroll(1L, 1L))
            .isInstanceOf(BusinessRuleViolationException.class);
    }
}
```

### 7.2 통합 테스트

| 규칙 | 설명 |
|------|------|
| DB 연동 필수 | 실제 DB(Testcontainers MySQL 또는 H2)를 사용하여 쿼리·트랜잭션 검증 |
| `@Transactional` | 데이터 격리를 위해 기본 사용. **단, 동시성 테스트에서는 사용 금지** |
| 대상 | Repository 커스텀 쿼리, Service + DB 연동, 트랜잭션 경계 |
| Context 캐싱 | `@ActiveProfiles("test")`를 통일하여 Spring Context 재사용 |

```java
@SpringBootTest
@Transactional
@ActiveProfiles("test")
class EnrollmentServiceIntegrationTest extends IntegrationTestSupport {

    @Autowired
    private EnrollmentService enrollmentService;

    @Test
    void 수강신청_성공시_강좌의_신청인원이_1_증가한다() {
        // given
        Student student = persistStudent();
        Course course = persistCourseWithCapacity(30, 0);

        // when
        enrollmentService.enroll(student.getId(), course.getId());

        // then
        Course updated = courseRepository.findById(course.getId()).orElseThrow();
        assertThat(updated.getEnrolled()).isEqualTo(1);
    }
}
```

### 7.3 API 테스트

| 규칙 | 설명 |
|------|------|
| 실제 HTTP 요청 | `MockMvc` 또는 `TestRestTemplate`으로 실제 HTTP 계층 통과 |
| 응답 형식 검증 | `docs/001-api-specification.md`에 정의된 JSON 구조와 일치하는지 검증 |
| HTTP 상태 코드 | 성공(200/201)과 에러(400/404/409) 케이스 모두 검증 |
| Content-Type | `application/json` 응답 확인 |

```java
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles("test")
class EnrollmentApiTest extends ApiTestSupport {

    @Autowired
    private TestRestTemplate restTemplate;

    @Test
    void 수강신청_성공시_201_Created와_응답_본문을_반환한다() {
        // given
        EnrollmentRequest request = new EnrollmentRequest(studentId, courseId);

        // when
        ResponseEntity<String> response = restTemplate.postForEntity(
            "/api/enrollments", request, String.class);

        // then
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.CREATED);
        DocumentContext json = JsonPath.parse(response.getBody());
        assertThat(json.read("$.success", Boolean.class)).isTrue();
        assertThat(json.read("$.data.studentId", Integer.class)).isEqualTo(studentId);
        assertThat(json.read("$.data.courseId", Integer.class)).isEqualTo(courseId);
    }
}
```

### 7.4 동시성 테스트 (핵심)

> 이 프로젝트에서 **가장 중요한 테스트 계층**. 요구사항의 "동시 요청 시나리오로 직접 검증"에 대응한다.

| 규칙 | 설명 |
|------|------|
| `@Transactional` 사용 금지 | 멀티스레드에서 각각 독립 트랜잭션이 필요하므로 테스트 레벨 `@Transactional`은 사용하지 않는다 |
| `ExecutorService` + `CountDownLatch` | 동시 실행을 보장하기 위해 `CountDownLatch`로 스레드 동기화 |
| 결과 검증은 DB 상태로 | 응답 코드 카운팅 + DB 최종 상태 검증을 **반드시 병행** |
| 데이터 정리 | `@AfterEach`에서 명시적으로 테스트 데이터 삭제 |
| 재현 가능성 | 최소 10회 반복 실행해도 동일 결과가 나와야 한다 |

```java
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles("test")
class EnrollmentConcurrencyTest {

    private static final int THREAD_COUNT = 100;

    @Test
    @DisplayName("정원 1석 강좌에 100명 동시 신청 → 정확히 1명만 성공")
    void 잔여_1석에_100명이_동시_신청하면_정확히_1명만_성공한다() throws InterruptedException {
        // given
        Course course = persistCourseWithCapacity(1, 0); // 정원 1명
        List<Student> students = persistStudents(THREAD_COUNT);

        ExecutorService executor = Executors.newFixedThreadPool(THREAD_COUNT);
        CountDownLatch readyLatch = new CountDownLatch(THREAD_COUNT);
        CountDownLatch startLatch = new CountDownLatch(1);
        AtomicInteger successCount = new AtomicInteger(0);
        AtomicInteger failCount = new AtomicInteger(0);

        // when
        for (int i = 0; i < THREAD_COUNT; i++) {
            final int idx = i;
            executor.submit(() -> {
                readyLatch.countDown();          // 준비 완료 신호
                startLatch.await();              // 일제히 시작 대기
                try {
                    enrollmentService.enroll(students.get(idx).getId(), course.getId());
                    successCount.incrementAndGet();
                } catch (Exception e) {
                    failCount.incrementAndGet();
                }
            });
        }
        readyLatch.await();   // 모든 스레드 준비 대기
        startLatch.countDown(); // 일제히 시작
        executor.shutdown();
        executor.awaitTermination(30, TimeUnit.SECONDS);

        // then — 애플리케이션 결과 검증
        assertThat(successCount.get()).isEqualTo(1);
        assertThat(failCount.get()).isEqualTo(THREAD_COUNT - 1);

        // then — DB 최종 상태 검증 (Defense-in-Depth)
        Course updated = courseRepository.findById(course.getId()).orElseThrow();
        assertThat(updated.getEnrolled()).isEqualTo(1);
        assertThat(enrollmentRepository.countByCourseId(course.getId())).isEqualTo(1);
    }
}
```

---

## 8. 요구사항별 테스트 매트릭스

> 모든 요구사항이 최소 하나의 테스트에 의해 검증됨을 보장하기 위한 추적 테이블.

### 8.1 비즈니스 규칙 테스트

| 요구사항 | 테스트 클래스 | 테스트 시나리오 | 계층 |
|----------|-------------|----------------|------|
| 정원 초과 불가 | `EnrollmentServiceTest` | 정원 가득 참 → 신청 실패 | Unit |
| 정원 초과 불가 (동시성) | `EnrollmentConcurrencyTest` | 잔여 1석에 100명 동시 → 1명만 성공 | Concurrency |
| 최대 18학점 | `EnrollmentServiceTest` | 현재 16학점 + 3학점 신청 → 실패 | Unit |
| 최대 18학점 (동시성) | `EnrollmentConcurrencyTest` | 잔여 3학점 학생이 3학점 강좌 2개 동시 → 1개만 성공 | Concurrency |
| 시간표 충돌 | `EnrollmentServiceTest` | 동일 시간대 강좌 신청 → 실패 | Unit |
| 시간표 충돌 (동시성) | `EnrollmentConcurrencyTest` | 같은 시간대 2개 강좌 동시 → 1개만 성공 | Concurrency |
| 중복 수강 불가 | `EnrollmentServiceTest` | 같은 강좌 재신청 → 실패 | Unit |
| 중복 수강 불가 (동시성) | `EnrollmentConcurrencyTest` | 같은 강좌 동시 2회 → 1회만 성공 | Concurrency |

### 8.2 API 계약 테스트

| 엔드포인트 | 테스트 클래스 | 검증 항목 |
|-----------|-------------|----------|
| `GET /health` | `HealthApiTest` | 200 OK, `{"status":"ok"}` |
| `GET /api/students` | `StudentApiTest` | 페이지네이션, departmentId 필터, 응답 필드 |
| `GET /api/students/{id}` | `StudentApiTest` | 200 성공, 404 존재하지 않는 ID |
| `GET /api/professors` | `ProfessorApiTest` | 페이지네이션, departmentId 필터 |
| `GET /api/courses` | `CourseApiTest` | 필수 필드(id, name, credits, capacity, enrolled, schedule) |
| `POST /api/enrollments` | `EnrollmentApiTest` | 201 성공, 400/404/409 에러 케이스 |
| `DELETE /api/enrollments/{id}` | `EnrollmentApiTest` | 200 성공, 404 에러, enrolled 감소 |
| `GET /api/students/{id}/enrollments` | `EnrollmentApiTest` | 시간표 응답 구조, currentCredits |

### 8.3 데이터 초기화 테스트

| 검증 항목 | 테스트 시나리오 |
|----------|---------------|
| 학과 10개 이상 | 서버 기동 후 `GET /api/departments` → 10개 이상 확인 |
| 강좌 500개 이상 | `GET /api/courses` → totalElements ≥ 500 |
| 학생 10,000명 이상 | `GET /api/students` → totalElements ≥ 10000 |
| 교수 100명 이상 | `GET /api/professors` → totalElements ≥ 100 |
| 현실적 데이터 | 이름이 "User1", "Course1" 패턴이 아닌지 검증 |
| 규칙 정합성 | 초기 데이터에 비즈니스 규칙 위반 없음 |

---

## 9. 테스트 인프라

### 9.1 DB 전략

| 환경 | DB | 근거 |
|------|-----|------|
| 단위 테스트 | Mock | DB 불필요 |
| 통합 / API / 동시성 테스트 | **Testcontainers (MySQL)** 또는 **H2 (MySQL 호환 모드)** | 프로덕션 DB와 동일한 동작 보장 |

**Testcontainers 우선 권장:**

```java
@Testcontainers
@SpringBootTest
@ActiveProfiles("test")
class EnrollmentServiceIntegrationTest {

    @Container
    static MySQLContainer<?> mysql = new MySQLContainer<>("mysql:8.0")
        .withDatabaseName("testdb");

    @DynamicPropertySource
    static void overrideProperties(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", mysql::getJdbcUrl);
        registry.add("spring.datasource.username", mysql::getUsername);
        registry.add("spring.datasource.password", mysql::getPassword);
    }
}
```

**H2 호환 모드 대안 (Docker 없는 환경):**

```yaml
# application-test.yml
spring:
  datasource:
    url: jdbc:h2:mem:testdb;MODE=MYSQL;DB_CLOSE_DELAY=-1
    driver-class-name: org.h2.Driver
  jpa:
    hibernate:
      ddl-auto: create-drop
```

### 9.2 Spring Context 캐싱 전략

Spring Boot 테스트에서 Context 로딩은 비용이 크다. 동일한 설정의 테스트들이 Context를 공유하도록 **공통 상위 클래스**를 사용한다.

```java
// 통합 테스트 공통 Base
@SpringBootTest
@ActiveProfiles("test")
@Transactional
public abstract class IntegrationTestSupport {
    // 공통 Bean 주입, 유틸리티 메서드
}

// API 테스트 공통 Base
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles("test")
public abstract class ApiTestSupport {
    @Autowired
    protected TestRestTemplate restTemplate;
}
```

---

## 10. 테스트 패키지 구조

```
src/test/java/com/musinsa/exam/
│
├── unit/                                    ← 단위 테스트
│   ├── service/
│   │   ├── EnrollmentServiceTest.java
│   │   ├── CourseServiceTest.java
│   │   └── StudentServiceTest.java
│   └── entity/
│       ├── CourseTest.java
│       └── EnrollmentTest.java
│
├── integration/                             ← 통합 테스트
│   ├── repository/
│   │   ├── CourseRepositoryTest.java
│   │   ├── EnrollmentRepositoryTest.java
│   │   └── StudentRepositoryTest.java
│   └── service/
│       ├── EnrollmentServiceIntegrationTest.java
│       └── DataInitializerTest.java
│
├── api/                                     ← API 테스트
│   ├── HealthApiTest.java
│   ├── StudentApiTest.java
│   ├── ProfessorApiTest.java
│   ├── CourseApiTest.java
│   └── EnrollmentApiTest.java
│
├── concurrency/                             ← 동시성 테스트
│   └── EnrollmentConcurrencyTest.java
│
├── fixture/                                 ← 테스트 픽스처
│   ├── TestStudentFactory.java
│   ├── TestCourseFactory.java
│   └── TestEnrollmentFactory.java
│
└── support/                                 ← 테스트 지원 클래스
    ├── IntegrationTestSupport.java
    ├── ApiTestSupport.java
    └── ConcurrencyTestSupport.java
```

---

## 11. 금지 사항 (Anti-Patterns)

| # | Anti-Pattern | 이유 | 대안 |
|---|-------------|------|------|
| 1 | **테스트 간 순서 의존** | 테스트 A가 삽입한 데이터를 테스트 B가 사용 → 실행 순서 변경 시 실패 | 각 테스트가 자신의 데이터를 독립적으로 설정 |
| 2 | **@BeforeAll에서 대량 시드 데이터** | 모든 테스트가 동일 시드에 의존 → 하나의 테스트 수정이 다른 테스트에 영향 | 각 테스트 메서드의 `given`에서 필요한 데이터만 생성 |
| 3 | **Thread.sleep()으로 동시성 검증** | 비결정적, 느림, 타이밍 의존 | `CountDownLatch` + `ExecutorService`로 정확한 동시 실행 보장 |
| 4 | **테스트에서 프로덕션 DataInitializer 의존** | 초기 데이터 변경 시 무관한 테스트가 깨짐 | 테스트 전용 데이터를 `given`에서 직접 생성 |
| 5 | **assertNotNull() 남발** | null이 아닌 것만 확인 → 잘못된 값이 들어와도 통과 | 구체적 값 검증: `assertThat(x).isEqualTo(expected)` |
| 6 | **@Disabled로 실패하는 테스트 방치** | 기술 부채 누적, 코드와 테스트의 괴리 | 즉시 수정하거나, 이슈를 생성하고 기한 내 해결 |
| 7 | **private 메서드 직접 테스트** | 구현 세부사항에 결합 → 리팩터링 시 테스트 깨짐 | public 메서드를 통해 간접적으로 검증 |
| 8 | **Mocking 과다 사용** | Mock이 너무 많으면 실제 동작과 괴리 → 테스트가 통과해도 의미 없음 | Mock은 외부 경계에서만. 핵심 로직은 통합 테스트로 보완 |
| 9 | **동시성 테스트에서 @Transactional** | 테스트 트랜잭션이 모든 스레드를 감싸면 동시성이 사라짐 | 동시성 테스트는 `@Transactional` 없이 + `@AfterEach` 정리 |
| 10 | **매직 넘버 사용** | `assertThat(count).isEqualTo(1)` — 1이 뭔지 모름 | 상수로 추출: `assertThat(successCount).isEqualTo(EXPECTED_SUCCESS)` |

---

## 12. 실행 및 리포트

### 12.1 테스트 실행 명령

```bash
# 전체 테스트 실행
./gradlew test

# 특정 계층만 실행 (태그 기반)
./gradlew test --tests "com.musinsa.exam.unit.*"
./gradlew test --tests "com.musinsa.exam.integration.*"
./gradlew test --tests "com.musinsa.exam.api.*"
./gradlew test --tests "com.musinsa.exam.concurrency.*"
```

### 12.2 JUnit 태그 활용

```java
@Tag("unit")
class EnrollmentServiceTest { }

@Tag("integration")
class EnrollmentServiceIntegrationTest { }

@Tag("concurrency")
class EnrollmentConcurrencyTest { }
```

```kotlin
// build.gradle.kts — 태그별 실행 태스크
tasks.register<Test>("unitTest") {
    useJUnitPlatform { includeTags("unit") }
}

tasks.register<Test>("integrationTest") {
    useJUnitPlatform { includeTags("integration") }
}

tasks.register<Test>("concurrencyTest") {
    useJUnitPlatform { includeTags("concurrency") }
}
```

### 12.3 테스트 리포트

```bash
# HTML 리포트 확인
open build/reports/tests/test/index.html
```

---

## 13. 타당성

| 관점 | 효과 |
|------|------|
| **요구사항 추적** | 테스트 매트릭스(8절)로 모든 요구사항이 테스트에 의해 커버됨을 증명 |
| **동시성 정확성** | 별도 동시성 테스트 계층으로 Race Condition 방지를 기계적으로 검증 |
| **회귀 방지** | 코드 변경 시 기존 동작이 깨지면 즉시 감지 |
| **문서 역할** | 한글 메서드명 + Given-When-Then으로 비개발자도 테스트 의도 파악 가능 |
| **빠른 피드백** | 테스트 피라미드 준수로 대부분의 검증이 밀리초 단위로 완료 |
| **신뢰성** | Anti-Pattern 금지 규칙으로 테스트 자체의 품질 보장 |

---

## 14. 대안 검토

| 대안 | 장점 | 미선택 이유 |
|------|------|------------|
| E2E 테스트 위주 (피라미드 역전) | 실제 사용자 시나리오에 가까움 | 느림, 불안정, 실패 원인 진단 어려움. 이 프로젝트는 백엔드만 구현하므로 API 테스트가 E2E 역할을 대체 |
| BDD 프레임워크 (Cucumber) | 비기술자와 명세 공유 | 설정 오버헤드 대비 평가 과제에서 얻는 이점이 적음. 한글 메서드명으로 충분히 의도 전달 가능 |
| Spock (Groovy) | Given-When-Then 네이티브, 간결 | Java 프로젝트에 Groovy 의존 추가는 과함. JUnit5 + AssertJ로 동등한 표현력 확보 가능 |
| 랜덤 테스트 데이터 (Faker) | 데이터 다양성 | 비결정적 테스트 위험. 고정 데이터로 재현 가능한 테스트가 우선 |
| Testcontainers 단독 (H2 배제) | 프로덕션 DB 완전 일치 | Docker 없는 환경에서 테스트 불가. H2 호환 모드를 fallback으로 유지 |

---

## 15. 필수 의존성

```kotlin
// build.gradle.kts — 테스트 의존성
dependencies {
    // 기존
    testImplementation("org.springframework.boot:spring-boot-starter-test")
    testRuntimeOnly("org.junit.platform:junit-platform-launcher")

    // 추가
    testImplementation("org.testcontainers:mysql:1.20.4")
    testImplementation("org.testcontainers:junit-jupiter:1.20.4")
    testRuntimeOnly("com.h2database:h2")  // Testcontainers fallback
}
```

> `spring-boot-starter-test`에 JUnit5, AssertJ, Mockito, MockMvc, JsonPath가 모두 포함되어 있으므로 별도 추가 불필요.

---

## 16. 참조

- ADR-0004: 백엔드 / DB 기술 선택
- `docs/REQUIREMENTS.md`: 비즈니스 규칙 및 동시성 제어 전략
- `docs/001-api-specification.md`: API 명세 (테스트 검증 기준)
- JUnit5 User Guide: https://junit.org/junit5/docs/current/user-guide/
- AssertJ Documentation: https://assertj.github.io/doc/
- Testcontainers: https://www.testcontainers.org/
