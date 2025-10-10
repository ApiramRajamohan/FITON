using FITON.Server.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;

namespace FITON.Server.Utils.Database
{
    public class AppDbContextFactory : IDesignTimeDbContextFactory<AppDbContext>
    {
        public AppDbContext CreateDbContext(string[] args)
        {
            var config = new ConfigurationBuilder()
                .SetBasePath(Directory.GetCurrentDirectory())
                .AddJsonFile("appsettings.json")
                .Build();

            var optionsBuilder = new DbContextOptionsBuilder<AppDbContext>();
            var connectionString = config.GetConnectionString("DefaultConnection"); // match your key in appsettings.json
            optionsBuilder.UseSqlServer(connectionString);

            return new AppDbContext(optionsBuilder.Options);
        }
    }
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        public DbSet<User> Users => Set<User>();
        public DbSet<RefreshToken> RefreshTokens => Set<RefreshToken>();
        public DbSet<Measurement> Measurements => Set<Measurement>();
        public DbSet<Outfit> Outfits => Set<Outfit>();

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<RefreshToken>()
                .HasIndex(rt => rt.Token)
                .IsUnique();

            modelBuilder.Entity<User>()
                .HasOne(u => u.Measurement)
                .WithOne(m => m.User)
                .HasForeignKey<Measurement>(m => m.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            // Outfit relationships
            modelBuilder.Entity<Outfit>()
                .HasOne(o => o.User)
                .WithMany(u => u.Outfits)
                .HasForeignKey(o => o.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            // Indexes for better performance
            modelBuilder.Entity<Outfit>()
                .HasIndex(o => o.UserId);

            modelBuilder.Entity<Outfit>()
                .HasIndex(o => o.Category);

            modelBuilder.Entity<Outfit>()
                .HasIndex(o => o.Type);
        }
    }
}
